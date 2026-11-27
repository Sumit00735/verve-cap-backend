import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { BRAND_ADMIN_EMAIL, BRAND_NAME } from '../src/core/brand';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = BRAND_ADMIN_EMAIL;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    process.stdout.write(`Seed: admin already exists (${email})\n`);
    return;
  }

  const passwordHash = await argon2.hash('ChangeMe123!Change', {
    type: argon2.argon2id,
  });

  await prisma.user.create({
    data: {
      email,
      name: 'Platform Admin',
      company: BRAND_NAME,
      contact: '+91 00000 00000',
      passwordHash,
      status: UserStatus.ACTIVE,
      role: UserRole.ADMIN,
    },
  });
  process.stdout.write(`Seed: created admin ${email}\n`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    throw error;
  });