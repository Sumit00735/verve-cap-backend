import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(config: AppConfigService) {
    this.client = new Redis(config.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  async ping(): Promise<boolean> {
    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  async pushMailJob(id: string): Promise<void> {
    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }
      await this.client.lpush('mail:outbox', id);
    } catch {
      // Queue is optional; pending rows are polled from the database.
    }
  }

  async setWithExpiry(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<void> {
    if (this.client.status === 'wait') {
      await this.client.connect();
    }
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  async get(key: string): Promise<string | null> {
    if (this.client.status === 'wait') {
      await this.client.connect();
    }
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    if (this.client.status === 'wait') {
      await this.client.connect();
    }
    await this.client.del(key);
  }

  async popMailJob(): Promise<string | null> {
    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }
      const id = await this.client.rpop('mail:outbox');
      return id ?? null;
    } catch {
      return null;
    }
  }
}
