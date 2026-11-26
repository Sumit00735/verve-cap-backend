import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ActiveGuard } from '../../core/auth/active.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import type { SessionUser } from '../../core/auth/auth.types';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { AppException } from '../../core/errors/app.exception';
import { Feature } from '../../core/features/feature.decorator';
import { updateProfileSchema } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@Feature('profile')
@Controller('profile')
@UseGuards(AuthGuard, ActiveGuard)
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  get(@CurrentUser() user: SessionUser | undefined) {
    if (!user) {
      throw new AppException('unauthorized', 'Sign in required', 401);
    }
    return this.profile.getProfile(user);
  }

  @Patch()
  async update(
    @CurrentUser() user: SessionUser | undefined,
    @Body() body: unknown,
  ) {
    if (!user) {
      throw new AppException('unauthorized', 'Sign in required', 401);
    }
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppException('bad_request', 'Invalid profile', 400);
    }
    return this.profile.updateProfile(user, parsed.data);
  }
}
