import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PasswordService } from '../../core/auth/password.service';
import { AppException } from '../../core/errors/app.exception';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { EmailOutboxService } from '../notifications/email-outbox.service';
import type { RegisterInput } from './dto/register.dto';

@Injectable()
export class AuthRegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly activity: ActivityLogService,
    private readonly mail: EmailOutboxService,
  ) {}

  async register(input: RegisterInput): Promise<{ status: 'pending' }> {
    let passwordHash: string;
    try {
      passwordHash = await this.passwords.hash(input.password);
    } catch {
      throw new AppException(
        'password_too_short',
        'Use at least 12 characters',
        400,
      );
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          company: input.company,
          contact: input.contact,
          passwordHash,
        },
      });

      await this.activity.record({
        actorId: user.id,
        action: 'user.registered',
        targetType: 'user',
        targetId: user.id,
        detail: user.email,
      });

      await this.mail.enqueue('registration_received', {
        name: user.name,
        email: user.email,
      });

      return { status: 'pending' };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AppException(
          'duplicate_email',
          'That email is already registered',
          409,
        );
      }
      throw error;
    }
  }
}
