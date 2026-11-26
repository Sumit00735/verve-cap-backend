import { Injectable } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { PasswordService } from '../../core/auth/password.service';
import { SessionService } from '../../core/auth/session.service';
import { AppException } from '../../core/errors/app.exception';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
  ) {}

  async login(
    input: LoginDto,
    reply: FastifyReply,
  ): Promise<{ user: ReturnType<SessionService['toSessionUser']> }> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppException('invalid_credentials', 'Invalid email or password', 401);
    }

    const valid = await this.passwords.verify(input.password, user.passwordHash);
    if (!valid) {
      throw new AppException('invalid_credentials', 'Invalid email or password', 401);
    }

    this.sessions.assertCanAuthenticate(user.status);
    await this.sessions.startSession(user, reply);

    return { user: this.sessions.toSessionUser(user) };
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<{ ok: true }> {
    await this.sessions.endSession(request, reply);
    return { ok: true };
  }

  async refresh(request: FastifyRequest, reply: FastifyReply): Promise<{ ok: true }> {
    await this.sessions.refreshSession(request, reply);
    return { ok: true };
  }

  me(request: FastifyRequest) {
    return this.sessions.resolveUser(request);
  }
}