import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigModule } from './core/config/config.module';
import { FeatureRegistryModule } from './core/features/feature-registry.module';
import { HealthModule } from './core/health/health.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { RedisModule } from './core/redis/redis.module';

@Module({
  imports: [
    AppConfigModule,
    FeatureRegistryModule,
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
  ],
})
export class AppModule {}
