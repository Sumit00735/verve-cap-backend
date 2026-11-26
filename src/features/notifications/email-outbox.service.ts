import { Injectable } from '@nestjs/common';
import type { EmailLog } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RedisService } from '../../core/redis/redis.service';
import {
  renderEmail,
  type EmailTemplateContext,
} from './templates/render-email';
import type { EmailTemplateKey } from './templates/template-keys';

const MAX_ATTEMPTS = 3;

@Injectable()
export class EmailOutboxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async enqueue(
    templateKey: EmailTemplateKey,
    context: EmailTemplateContext,
  ): Promise<void> {
    const rendered = renderEmail(templateKey, context);
    const row = await this.prisma.emailLog.create({
      data: {
        templateKey,
        toEmail: context.email,
        subject: rendered.subject,
        bodyText: rendered.text,
        bodyHtml: rendered.html,
      },
    });
    await this.redis.pushMailJob(row.id);
  }

  async claimPending(): Promise<EmailLog | null> {
    const id =
      (await this.redis.popMailJob()) ??
      (
        await this.prisma.emailLog.findFirst({
          where: { status: 'PENDING', attempts: { lt: MAX_ATTEMPTS } },
          orderBy: { createdAt: 'asc' },
          select: { id: true },
        })
      )?.id;

    if (!id) {
      return null;
    }

    const row = await this.prisma.emailLog.findUnique({ where: { id } });
    if (!row || row.status !== 'PENDING' || row.attempts >= MAX_ATTEMPTS) {
      return null;
    }

    return row;
  }

  markSent(id: string): Promise<unknown> {
    return this.prisma.emailLog.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    const row = await this.prisma.emailLog.findUnique({ where: { id } });
    if (!row) {
      return;
    }
    const attempts = row.attempts + 1;
    const status = attempts >= MAX_ATTEMPTS ? 'FAILED' : 'PENDING';
    await this.prisma.emailLog.update({
      where: { id },
      data: {
        attempts,
        lastError: error.slice(0, 500),
        status,
      },
    });
    if (status === 'PENDING') {
      await this.redis.pushMailJob(id);
    }
  }

  async list(params: { limit: number; cursor?: string }) {
    const rows = await this.prisma.emailLog.findMany({
      take: params.limit + 1,
      orderBy: { createdAt: 'desc' },
      ...(params.cursor
        ? { cursor: { id: params.cursor }, skip: 1 }
        : undefined),
    });

    const hasMore = rows.length > params.limit;
    const items = hasMore ? rows.slice(0, params.limit) : rows;

    return {
      items: items.map((item) => ({
        id: item.id,
        templateKey: item.templateKey,
        toEmail: item.toEmail,
        subject: item.subject,
        status: item.status,
        attempts: item.attempts,
        lastError: item.lastError,
        createdAt: item.createdAt.toISOString(),
        sentAt: item.sentAt?.toISOString() ?? null,
      })),
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
    };
  }
}
