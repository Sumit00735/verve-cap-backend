import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import type { SessionUser } from './auth.types';

type AuthRequest = FastifyRequest & { user?: SessionUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionUser | undefined => {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    return request.user;
  },
);