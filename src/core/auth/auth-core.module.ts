import { Global, Module } from '@nestjs/common';
import { ActiveGuard } from './active.guard';
import { AdminGuard } from './admin.guard';
import { AuthGuard } from './auth.guard';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';

@Global()
@Module({
  providers: [
    PasswordService,
    SessionService,
    AuthGuard,
    ActiveGuard,
    AdminGuard,
  ],
  exports: [
    PasswordService,
    SessionService,
    AuthGuard,
    ActiveGuard,
    AdminGuard,
  ],
})
export class AuthCoreModule {}
