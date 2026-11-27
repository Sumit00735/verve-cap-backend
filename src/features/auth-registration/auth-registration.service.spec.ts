import { UserStatus } from '@prisma/client';
import { PasswordService } from '../../core/auth/password.service';
import { AppConfigService } from '../../core/config/config.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RedisService } from '../../core/redis/redis.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { EmailOutboxService } from '../notifications/email-outbox.service';
import { AuthRegistrationService } from './auth-registration.service';

describe('AuthRegistrationService', () => {
  const prisma = {
    user: {
      create: jest.fn(),
    },
  } as unknown as PrismaService;

  const passwords = {
    hash: jest.fn().mockResolvedValue('hash'),
  } as unknown as PasswordService;

  const activity = {
    record: jest.fn(),
  } as unknown as ActivityLogService;

  const mail = {
    enqueue: jest.fn(),
  } as unknown as EmailOutboxService;

  const redis = {
    get: jest.fn().mockResolvedValue('123456'),
    del: jest.fn(),
    setWithExpiry: jest.fn(),
  } as unknown as RedisService;

  const config = {
    env: { REGISTRATION_VERIFY_TEST_CODE: '123456' },
  } as unknown as AppConfigService;

  it('returns pending after registration', async () => {
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      name: 'Ada',
      status: UserStatus.PENDING,
    });

    const service = new AuthRegistrationService(
      prisma,
      passwords,
      activity,
      mail,
      redis,
      config,
    );
    const result = await service.register({
      name: 'Ada',
      email: 'a@b.com',
      contact: '9000000000',
      password: 'LongEnough-Pass1',
      verificationCode: '123456',
      profession: 'CA',
    });

    expect(result).toEqual({ status: 'pending' });
    expect(activity.record).toHaveBeenCalled();
  });
});