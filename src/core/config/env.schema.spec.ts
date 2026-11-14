import { parseEnv } from './env.schema';

describe('parseEnv', () => {
  it('applies defaults for development', () => {
    const env = parseEnv({
      NODE_ENV: 'development',
    });
    expect(env.PORT).toBe(3001);
    expect(env.COOKIE_SECURE).toBe(false);
  });

  it('rejects production without secure cookies', () => {
    expect(() =>
      parseEnv({
        NODE_ENV: 'production',
        COOKIE_SECURE: 'false',
      }),
    ).toThrow(/COOKIE_SECURE/);
  });
});