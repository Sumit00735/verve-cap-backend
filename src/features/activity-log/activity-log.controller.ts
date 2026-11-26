import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { AdminGuard } from '../../core/auth/admin.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import { Feature } from '../../core/features/feature.decorator';
import { AppException } from '../../core/errors/app.exception';
import { ActivityLogService } from './activity-log.service';

const listSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().uuid().optional(),
    action: z.string().min(1).max(80).optional(),
  })
  .strict();

@Feature('activity-log')
@Controller('admin/activity')
@UseGuards(AuthGuard, AdminGuard)
export class ActivityLogController {
  constructor(private readonly activity: ActivityLogService) {}

  @Get()
  async list(@Query() query: Record<string, unknown>) {
    const parsed = listSchema.safeParse(query);
    if (!parsed.success) {
      throw new AppException('bad_request', 'Invalid query', 400);
    }

    const result = await this.activity.list(parsed.data);
    return {
      items: result.items.map((row) => ({
        id: row.id,
        action: row.action,
        targetType: row.targetType,
        targetId: row.targetId,
        detail: row.detail,
        createdAt: row.createdAt.toISOString(),
        actor: row.actor,
      })),
      nextCursor: result.nextCursor,
    };
  }
}