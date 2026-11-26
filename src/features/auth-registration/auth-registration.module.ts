import { Module } from '@nestjs/common';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthRegistrationController } from './auth-registration.controller';
import { AuthRegistrationService } from './auth-registration.service';

@Module({
  imports: [ActivityLogModule, NotificationsModule],
  controllers: [AuthRegistrationController],
  providers: [AuthRegistrationService],
})
export class AuthRegistrationModule {}
