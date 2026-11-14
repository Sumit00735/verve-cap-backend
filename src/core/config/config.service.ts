import { Injectable } from '@nestjs/common';
import { type Env, parseEnv } from './env.schema';

@Injectable()
export class AppConfigService {
  readonly env: Env;

  constructor() {
    this.env = parseEnv();
  }

  get nodeEnv(): Env['NODE_ENV'] {
    return this.env.NODE_ENV;
  }

  get port(): number {
    return this.env.PORT;
  }

  get isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }

  get enabledFeatures(): string[] {
    const raw = this.env.FEATURES_ENABLED;
    if (!raw?.trim()) {
      return [];
    }
    return raw
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean);
  }
}
