import { Injectable } from '@nestjs/common';
import { User, UserRole, UserStatus } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SignJWT, jwtVerify } from 'jose';
import { AppConfigService } from '../config/config.service';
import { AppException } from '../errors/app.exception';
import { PrismaService } from '../prisma/prisma.service';
import type { AccessClaims, SessionUser } from './auth.types';
import { hashToken, randomToken } from './token-hash';

const ACCESS_COOKIE = 'vc_at';
const REFRESH_COOKIE = 'vc_rt';

@Injectable()
export class SessionService {
  private readonly secret: Uint8Array;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {
    this.secret = new TextEncoder().encode(this.config.env.SESSION_SECRET);
  }

  async startSession(user: User, reply: FastifyReply): Promise<void> {
    const familyId = randomToken(16);
    const refreshToken = await this.createRefreshToken(user.id, familyId);
    const accessToken = await this.signAccessToken(user, familyId);
    this.setCookies(reply, accessToken, refreshToken);
  }

  async refreshSession(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const raw = this.readRefreshCookie(request);
    if (!raw) {
      throw new AppException('unauthorized', 'Sign in required', 401);
    }

    const tokenHash = hashToken(raw);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      if (stored) {
        await this.revokeFamily(stored.familyId);
      }
      throw new AppException('unauthorized', 'Sign in required', 401);
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const refreshToken = await this.createRefreshToken(
      stored.userId,
      stored.familyId,
    );
    const accessToken = await this.signAccessToken(stored.user, stored.familyId);
    this.setCookies(reply, accessToken, refreshToken);
  }

  async endSession(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const raw = this.readRefreshCookie(request);
    if (raw) {
      const tokenHash = hashToken(raw);
      const stored = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
      });
      if (stored) {
        await this.revokeFamily(stored.familyId);
      }
    }
    this.clearCookies(reply);
  }

  async resolveUser(request: FastifyRequest): Promise<SessionUser | null> {
    const access = request.cookies?.[ACCESS_COOKIE];
    if (!access) {
      return null;
    }

    let claims: AccessClaims;
    try {
      const verified = await jwtVerify(access, this.secret);
      claims = verified.payload as unknown as AccessClaims;
    } catch {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: claims.sub },
    });
    if (!user) {
      return null;
    }

    return this.toSessionUser(user);
  }

  toSessionUser(user: User): SessionUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      contact: user.contact,
      status: user.status,
      role: user.role,
    };
  }

  private async signAccessToken(user: User, familyId: string): Promise<string> {
    const expiresMinutes = this.config.env.ACCESS_TOKEN_MINUTES;
    return new SignJWT({
      role: user.role,
      status: user.status,
      familyId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(`${expiresMinutes}m`)
      .sign(this.secret);
  }

  private async createRefreshToken(
    userId: string,
    familyId: string,
  ): Promise<string> {
    const raw = randomToken();
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + this.config.env.REFRESH_TOKEN_DAYS,
    );

    await this.prisma.refreshToken.create({
      data: {
        userId,
        familyId,
        tokenHash: hashToken(raw),
        expiresAt,
      },
    });

    return raw;
  }

  private async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private setCookies(
    reply: FastifyReply,
    accessToken: string,
    refreshToken: string,
  ): void {
    const secure = this.config.env.COOKIE_SECURE;
    const sameSite = secure ? 'strict' : 'lax';
    const accessSeconds = this.config.env.ACCESS_TOKEN_MINUTES * 60;
    const refreshSeconds = this.config.env.REFRESH_TOKEN_DAYS * 86400;

    void reply.setCookie(ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
      maxAge: accessSeconds,
    });
    void reply.setCookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
      maxAge: refreshSeconds,
    });
  }

  private clearCookies(reply: FastifyReply): void {
    const secure = this.config.env.COOKIE_SECURE;
    const sameSite = secure ? 'strict' : 'lax';
    void reply.clearCookie(ACCESS_COOKIE, { path: '/', secure, sameSite });
    void reply.clearCookie(REFRESH_COOKIE, { path: '/', secure, sameSite });
  }

  private readRefreshCookie(request: FastifyRequest): string | undefined {
    const value = request.cookies?.[REFRESH_COOKIE];
    return typeof value === 'string' ? value : undefined;
  }

  assertCanAuthenticate(status: UserStatus): void {
    if (
      status === UserStatus.REJECTED ||
      status === UserStatus.SUSPENDED ||
      status === UserStatus.DEACTIVATED
    ) {
      throw new AppException(
        'account_blocked',
        'This account cannot sign in',
        403,
      );
    }
  }

  assertActive(user: SessionUser): void {
    if (user.status !== UserStatus.ACTIVE) {
      throw new AppException(
        'account_not_active',
        'Account is not active',
        403,
      );
    }
  }

  assertAdmin(user: SessionUser): void {
    if (user.role !== UserRole.ADMIN) {
      throw new AppException('not_found', 'Not found', 404);
    }
  }
}