import { Injectable } from '@nestjs/common';
import type { SessionUser } from '../../core/auth/auth.types';
import { SessionService } from '../../core/auth/session.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import type { UpdateProfileInput } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionService,
    private readonly activity: ActivityLogService,
  ) {}

  getProfile(user: SessionUser) {
    return { user };
  }

  async updateProfile(user: SessionUser, input: UpdateProfileInput) {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: input.name,
        company: input.company,
        contact: input.contact,
      },
    });

    await this.activity.record({
      actorId: user.id,
      action: 'user.profile_updated',
      targetType: 'user',
      targetId: user.id,
      detail: user.email,
    });

    return { user: this.sessions.toSessionUser(updated) };
  }
}
