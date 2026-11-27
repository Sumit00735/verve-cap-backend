import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { randomInt } from 'node:crypto';
import { PasswordService } from '../../core/auth/password.service';
import { AppConfigService } from '../../core/config/config.service';
import { AppException } from '../../core/errors/app.exception';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RedisService } from '../../core/redis/redis.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { EmailOutboxService } from '../notifications/email-outbox.service';
import type { RegisterInput } from './dto/register.dto';
import type { SendVerificationInput } from './dto/send-verification.dto';
import type { VerifyCodeInput } from './dto/verify-code.dto';

const CODE_TTL_SECONDS = 900;
const codeKey = (email: string) =>
  `registration:verify:${email.trim().toLowerCase()}`;

@Injectable()
export class AuthRegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly activity: ActivityLogService,
    private readonly mail: EmailOutboxService,
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
  ) {}

  async sendVerification(input: SendVerificationInput): Promise<{ sent: true }> {
    const email = input.email.trim().toLowerCase();
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    await this.redis.setWithExpiry(codeKey(email), code, CODE_TTL_SECONDS);
    await this.mail.enqueue('registration_verify_code', {
      email,
      name: email.split('@')[0] ?? 'there',
      verificationCode: code,
    });
    return { sent: true };
  }

  async verifyCode(input: VerifyCodeInput): Promise<{ verified: true }> {
    const email = input.email.trim().toLowerCase();
    await this.assertVerificationCode(email, input.verificationCode);
    return { verified: true };
  }

  async register(input: RegisterInput): Promise<{ status: 'pending' }> {
    const email = input.email.trim().toLowerCase();
    await this.assertVerificationCode(email, input.verificationCode);

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
          email,
          company: '',
          contact: input.contact,
          passwordHash,
          role: UserRole.USER,
          profession: input.profession,
        },
      });

      await this.redis.del(codeKey(email));

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

  private async assertVerificationCode(
    email: string,
    submitted: string,
  ): Promise<void> {
    const testCode = this.config.env.REGISTRATION_VERIFY_TEST_CODE;
    if (testCode && submitted === testCode) {
      return;
    }

    const stored = await this.redis.get(codeKey(email));
    if (!stored || stored !== submitted) {
      throw new AppException(
        'invalid_verification_code',
        'Verification code is invalid or expired',
        400,
      );
    }
  }
}