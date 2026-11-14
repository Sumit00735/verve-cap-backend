import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export type ReadinessChecks = {
  database: boolean;
  redis: boolean;
};

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  liveness(): { status: 'ok' } {
    return { status: 'ok' };
  }

  async readiness(): Promise<{
    status: 'ok' | 'degraded';
    checks: ReadinessChecks;
  }> {
    const [database, redis] = await Promise.all([
      this.prisma.ping(),
      this.redis.ping(),
    ]);
    const checks = { database, redis };
    const ok = database && redis;
    return {
      status: ok ? 'ok' : 'degraded',
      checks,
    };
  }
}
