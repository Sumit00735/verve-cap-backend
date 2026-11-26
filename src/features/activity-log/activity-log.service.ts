import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: {
    actorId?: string;
    action: string;
    targetType: string;
    targetId?: string;
    detail?: string;
  }): Promise<void> {
    await this.prisma.activityLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        detail: input.detail,
      },
    });
  }

  async list(params: {
    limit: number;
    cursor?: string;
    action?: string;
  }): Promise<{
    items: {
      id: string;
      action: string;
      targetType: string;
      targetId: string | null;
      detail: string | null;
      createdAt: Date;
      actor: { id: string; email: string; name: string } | null;
    }[];
    nextCursor: string | null;
  }> {
    const where: Prisma.ActivityLogWhereInput = {};
    if (params.action) {
      where.action = params.action;
    }

    const rows = await this.prisma.activityLog.findMany({
      where,
      take: params.limit + 1,
      orderBy: { createdAt: 'desc' },
      ...(params.cursor
        ? { cursor: { id: params.cursor }, skip: 1 }
        : undefined),
      include: {
        actor: { select: { id: true, email: true, name: true } },
      },
    });

    const hasMore = rows.length > params.limit;
    const items = hasMore ? rows.slice(0, params.limit) : rows;

    return {
      items,
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
    };
  }
}
