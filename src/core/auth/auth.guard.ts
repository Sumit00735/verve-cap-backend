import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AppException } from '../errors/app.exception';
import type { SessionUser } from './auth.types';
import { SessionService } from './session.service';

type AuthRequest = FastifyRequest & { user?: SessionUser };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessions: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = await this.sessions.resolveUser(request);
    if (!user) {
      throw new AppException('unauthorized', 'Sign in required', 401);
    }
    request.user = user;
    return true;
  }
}
