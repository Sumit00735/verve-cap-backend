import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AuthCoreModule } from './core/auth/auth-core.module';
import { AppConfigModule } from './core/config/config.module';
import { FeatureRegistryModule } from './core/features/feature-registry.module';
import { HealthModule } from './core/health/health.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { RedisModule } from './core/redis/redis.module';
import { ActivityLogModule } from './features/activity-log/activity-log.module';
import { AdminDashboardModule } from './features/admin-dashboard/admin-dashboard.module';
import { AdminUsersModule } from './features/admin-users/admin-users.module';
import { AuthRegistrationModule } from './features/auth-registration/auth-registration.module';
import { AuthSessionsModule } from './features/auth-sessions/auth-sessions.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { CompaniesModule } from './features/companies/companies.module';
import { ProfileModule } from './features/profile/profile.module';
import { RolesAccessModule } from './features/roles-access/roles-access.module';
import { PasswordResetModule } from './features/password-reset/password-reset.module';

@Module({
  imports: [
    AppConfigModule,
    FeatureRegistryModule,
    AuthCoreModule,
    LoggerModule.forRoot({
      pinoHttp: {
        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
          'res.headers["set-cookie"]',
        ],
        customProps: (req) => ({
          requestId: (req as { requestId?: string }).requestId,
        }),
      },
    }),
    PrismaModule,
    RedisModule,
    HealthModule,
    ActivityLogModule,
    AuthRegistrationModule,
    AuthSessionsModule,
    PasswordResetModule,
    AdminUsersModule,
    AdminDashboardModule,
    NotificationsModule,
    RolesAccessModule,
    ProfileModule,
    CompaniesModule,
  ],
})
export class AppModule {}
