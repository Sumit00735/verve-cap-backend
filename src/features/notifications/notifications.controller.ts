import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { AdminGuard } from '../../core/auth/admin.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import { AppException } from '../../core/errors/app.exception';
import { Feature } from '../../core/features/feature.decorator';
import { EmailOutboxService } from './email-outbox.service';

const listSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().uuid().optional(),
  })
  .strict();

@Feature('notifications')
@Controller('admin/emails')
@UseGuards(AuthGuard, AdminGuard)
export class NotificationsController {
  constructor(private readonly outbox: EmailOutboxService) {}

  @Get()
  async list(@Query() query: Record<string, unknown>) {
    const parsed = listSchema.safeParse(query);
    if (!parsed.success) {
      throw new AppException('bad_request', 'Invalid query', 400);
    }
    return this.outbox.list(parsed.data);
  }
}
