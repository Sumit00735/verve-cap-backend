import { Module } from '@nestjs/common';
import { AdminUsersModule } from '../admin-users/admin-users.module';
import { RolesAccessController } from './roles-access.controller';

@Module({
  imports: [AdminUsersModule],
  controllers: [RolesAccessController],
})
export class RolesAccessModule {}
