import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthGuard } from '../../core/auth/auth.guard';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import type { SessionUser } from '../../core/auth/auth.types';
import { Feature } from '../../core/features/feature.decorator';
import { AppException } from '../../core/errors/app.exception';
import { AuthSessionsService } from './auth-sessions.service';
import { loginSchema } from './dto/login.dto';

@Feature('auth-sessions')
@Controller('auth')
export class AuthSessionsController {
  constructor(private readonly auth: AuthSessionsService) {}

  @Post('login')
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppException('bad_request', 'Invalid login', 400);
    }
    return this.auth.login(parsed.data, reply);
  }

  @Post('logout')
  async logout(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return this.auth.logout(request, reply);
  }

  @Post('refresh')
  async refresh(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    return this.auth.refresh(request, reply);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: SessionUser | undefined) {
    if (!user) {
      throw new AppException('unauthorized', 'Sign in required', 401);
    }
    return { user };
  }
}
