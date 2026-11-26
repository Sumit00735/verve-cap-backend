import { Module } from '@nestjs/common';
import { AuthCoreModule } from '../../core/auth/auth-core.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [AuthCoreModule, ActivityLogModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
