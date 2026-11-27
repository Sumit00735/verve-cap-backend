import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { z } from 'zod';
import { AdminGuard } from '../../core/auth/admin.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import type { SessionUser } from '../../core/auth/auth.types';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { Feature } from '../../core/features/feature.decorator';
import { AppException } from '../../core/errors/app.exception';
import { AdminUsersService } from './admin-users.service';

const listSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().uuid().optional(),
    status: z.nativeEnum(UserStatus).optional(),
    role: z.nativeEnum(UserRole).optional(),
    q: z.string().max(120).optional(),
  })
  .strict();

const patchSchema = z
  .object({
    status: z.nativeEnum(UserStatus),
  })
  .strict();

@Feature('admin-users')
@Controller('admin/users')
@UseGuards(AuthGuard, AdminGuard)
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  @Get()
  async list(@Query() query: Record<string, unknown>) {
    const parsed = listSchema.safeParse(query);
    if (!parsed.success) {
      throw new AppException('bad_request', 'Invalid query', 400);
    }
    return this.users.list({
      limit: parsed.data.limit,
      cursor: parsed.data.cursor,
      status: parsed.data.status,
      role: parsed.data.role,
      query: parsed.data.q,
    });
  }

  @Patch(':id/status')
  async setStatus(
    @CurrentUser() actor: SessionUser | undefined,
    @Param('id') userId: string,
    @Body() body: unknown,
  ) {
    if (!actor) {
      throw new AppException('unauthorized', 'Sign in required', 401);
    }
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppException('bad_request', 'Invalid status', 400);
    }
    return this.users.updateStatus(actor, userId, parsed.data.status);
  }
}
