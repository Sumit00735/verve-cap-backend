import { Module } from '@nestjs/common';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { AuthRegistrationController } from './auth-registration.controller';
import { AuthRegistrationService } from './auth-registration.service';

@Module({
  imports: [ActivityLogModule],
  controllers: [AuthRegistrationController],
  providers: [AuthRegistrationService],
})
export class AuthRegistrationModule {}
