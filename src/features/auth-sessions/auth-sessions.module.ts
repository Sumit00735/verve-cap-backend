import { Module } from '@nestjs/common';
import { AuthSessionsController } from './auth-sessions.controller';
import { AuthSessionsService } from './auth-sessions.service';

@Module({
  controllers: [AuthSessionsController],
  providers: [AuthSessionsService],
})
export class AuthSessionsModule {}
