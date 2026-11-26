import { UserStatus } from '@prisma/client';
import { PasswordService } from '../../core/auth/password.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
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

  it('returns pending after registration', async () => {
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      status: UserStatus.PENDING,
    });

    const service = new AuthRegistrationService(prisma, passwords, activity);
    const result = await service.register({
      name: 'Ada',
      email: 'a@b.com',
      company: 'Acme',
      contact: '+91 90000 00000',
      password: 'long-enough-password',
    });

    expect(result).toEqual({ status: 'pending' });
    expect(activity.record).toHaveBeenCalled();
  });
});
