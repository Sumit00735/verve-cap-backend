import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { AdminGuard } from '../../core/auth/admin.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import type { SessionUser } from '../../core/auth/auth.types';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { AppException } from '../../core/errors/app.exception';
import { Feature } from '../../core/features/feature.decorator';
import { AdminUsersService } from '../admin-users/admin-users.service';

const roleSchema = z
  .object({
    role: z.nativeEnum(UserRole),
  })
  .strict();

@Feature('roles-access')
@Controller('admin/users')
@UseGuards(AuthGuard, AdminGuard)
export class RolesAccessController {
  constructor(private readonly users: AdminUsersService) {}

  @Patch(':id/role')
  async setRole(
    @CurrentUser() actor: SessionUser | undefined,
    @Param('id') userId: string,
    @Body() body: unknown,
  ) {
    if (!actor) {
      throw new AppException('unauthorized', 'Sign in required', 401);
    }
    const parsed = roleSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppException('bad_request', 'Invalid role', 400);
    }
    return this.users.updateRole(actor, userId, parsed.data.role);
  }
}
