import { Injectable } from '@nestjs/common';
import { PasswordService } from '../../core/auth/password.service';
import { hashToken, randomToken } from '../../core/auth/token-hash';
import { AppConfigService } from '../../core/config/config.service';
import { AppException } from '../../core/errors/app.exception';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EmailOutboxService } from '../notifications/email-outbox.service';

const RESET_MINUTES = 15;

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly config: AppConfigService,
    private readonly mail: EmailOutboxService,
  ) {}

  async requestReset(email: string): Promise<{ accepted: true }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const raw = randomToken();
      const expiresAt = new Date(Date.now() + RESET_MINUTES * 60_000);
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(raw),
          expiresAt,
        },
      });
      const resetUrl = new URL('/reset-password', this.config.env.APP_ORIGIN);
      resetUrl.searchParams.set('token', raw);
      await this.mail.enqueue('password_reset', {
        name: user.name,
        email: user.email,
        resetUrl: resetUrl.toString(),
      });
    }
    return { accepted: true };
  }

  async resetPassword(input: {
    token: string;
    password: string;
  }): Promise<{ ok: true }> {
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

    const tokenHash = hashToken(input.token);
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new AppException('invalid_token', 'Reset link is invalid', 400);
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { ok: true };
  }
}
