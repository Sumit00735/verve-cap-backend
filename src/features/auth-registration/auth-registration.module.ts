import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../core/config/config.module';
import { RedisModule } from '../../core/redis/redis.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthRegistrationController } from './auth-registration.controller';
import { AuthRegistrationService } from './auth-registration.service';

@Module({
  imports: [ActivityLogModule, NotificationsModule, RedisModule, AppConfigModule],
  controllers: [AuthRegistrationController],
  providers: [AuthRegistrationService],
})
export class AuthRegistrationModule {}
