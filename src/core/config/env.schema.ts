import { z } from 'zod';
import { BRAND_MAIL_FROM } from '../brand';

const nodeEnvSchema = z.enum(['development', 'test', 'production']);

export const envSchema = z
  .object({
    NODE_ENV: nodeEnvSchema.default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    APP_ORIGIN: z.string().url().default('http://127.0.0.1:3000'),
    DATABASE_URL: z
      .string()
      .min(1)
      .default(
        'postgresql://dealdesk:dealdesk@127.0.0.1:5432/dealdesk?schema=public',
      ),
    REDIS_URL: z.string().min(1).default('redis://127.0.0.1:6379'),
    SENTRY_DSN: z.string().url().optional(),
    FEATURES_ENABLED: z.string().optional(),
    COOKIE_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    SESSION_SECRET: z
      .string()
      .min(32)
      .default('dev-only-session-secret-min-32-chars'),
    ACCESS_TOKEN_MINUTES: z.coerce.number().int().min(5).max(60).default(10),
    REFRESH_TOKEN_DAYS: z.coerce.number().int().min(1).max(90).default(14),
    MAIL_TRANSPORT: z.enum(['smtp', 'noop']).optional(),
    MAIL_SMTP_HOST: z.string().min(1).default('127.0.0.1'),
    MAIL_SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(1025),
    MAIL_FROM: z.string().email().default(BRAND_MAIL_FROM),
    REGISTRATION_VERIFY_TEST_CODE: z
      .string()
      .regex(/^\d{6}$/)
      .optional(),
  })
  .strict()
  .transform((data) => {
    const mailTransport =
      data.MAIL_TRANSPORT ??
      (data.NODE_ENV === 'test' ? ('noop' as const) : ('smtp' as const));
    return { ...data, MAIL_TRANSPORT: mailTransport };
  });

export type Env = z.infer<typeof envSchema>;

const envKeys = [
  'NODE_ENV',
  'PORT',
  'APP_ORIGIN',
  'DATABASE_URL',
  'REDIS_URL',
  'SENTRY_DSN',
  'FEATURES_ENABLED',
  'COOKIE_SECURE',
  'SESSION_SECRET',
  'ACCESS_TOKEN_MINUTES',
  'REFRESH_TOKEN_DAYS',
  'MAIL_TRANSPORT',
  'MAIL_SMTP_HOST',
  'MAIL_SMTP_PORT',
  'MAIL_FROM',
  'REGISTRATION_VERIFY_TEST_CODE',
] as const;

export function pickEnv(
  source: NodeJS.ProcessEnv,
): Record<string, string | undefined> {
  return Object.fromEntries(envKeys.map((key) => [key, source[key]]));
}

export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(pickEnv(source));
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid configuration: ${detail}`);
  }
  if (parsed.data.NODE_ENV === 'production' && !parsed.data.COOKIE_SECURE) {
    throw new Error(
      'Invalid configuration: COOKIE_SECURE must be true in production',
    );
  }
  if (
    parsed.data.NODE_ENV === 'production' &&
    parsed.data.REGISTRATION_VERIFY_TEST_CODE
  ) {
    throw new Error(
      'Invalid configuration: REGISTRATION_VERIFY_TEST_CODE is not allowed in production',
    );
  }
  return parsed.data;
}
