import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AppException } from '../errors/app.exception';
import type { SessionUser } from './auth.types';
import { SessionService } from './session.service';

type AuthRequest = FastifyRequest & { user?: SessionUser };

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly sessions: SessionService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;
    if (!user) {
      throw new AppException('unauthorized', 'Sign in required', 401);
    }
    this.sessions.assertAdmin(user);
    return true;
  }
}
