import { Injectable } from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { SessionUser } from '../../core/auth/auth.types';
import { AppException } from '../../core/errors/app.exception';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { EmailOutboxService } from '../notifications/email-outbox.service';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityLogService,
    private readonly mail: EmailOutboxService,
  ) {}

  async list(params: {
    limit: number;
    cursor?: string;
    status?: UserStatus;
    query?: string;
  }) {
    const where: Prisma.UserWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.query?.trim()) {
      const q = params.query.trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.user.findMany({
      where,
      take: params.limit + 1,
      orderBy: { createdAt: 'desc' },
      ...(params.cursor
        ? { cursor: { id: params.cursor }, skip: 1 }
        : undefined),
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        contact: true,
        status: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const hasMore = rows.length > params.limit;
    const items = hasMore ? rows.slice(0, params.limit) : rows;

    return {
      items: items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
    };
  }

  async updateStatus(
    actor: SessionUser,
    userId: string,
    status: UserStatus,
  ): Promise<{ id: string; status: UserStatus }> {
    const target = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      throw new AppException('not_found', 'Not found', 404);
    }

    if (target.role === UserRole.ADMIN && status !== UserStatus.ACTIVE) {
      throw new AppException('bad_request', 'Cannot change admin status', 400);
    }

    if (target.status === UserStatus.PENDING) {
      if (status !== UserStatus.ACTIVE && status !== UserStatus.REJECTED) {
        throw new AppException(
          'bad_request',
          'Pending accounts can be approved or rejected',
          400,
        );
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    await this.activity.record({
      actorId: actor.id,
      action: 'user.status_changed',
      targetType: 'user',
      targetId: userId,
      detail: `${target.status} -> ${status}`,
    });

    if (status === UserStatus.ACTIVE && target.status === UserStatus.PENDING) {
      await this.mail.enqueue('account_approved', {
        name: updated.name,
        email: updated.email,
      });
    }
    if (status === UserStatus.REJECTED) {
      await this.mail.enqueue('account_rejected', {
        name: updated.name,
        email: updated.email,
      });
    }

    return { id: updated.id, status: updated.status };
  }
}
