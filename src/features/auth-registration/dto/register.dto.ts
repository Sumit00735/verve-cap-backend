import { UserProfession } from '@prisma/client';
import { z } from 'zod';
import { isStrongPassword } from '../password-policy';

export const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().toLowerCase().email().max(254),
    company: z.string().trim().min(1).max(200),
    contact: z.string().trim().regex(/^\d{5,15}$/, 'Enter 5–15 digits only'),
    profession: z.nativeEnum(UserProfession),
    password: z
      .string()
      .min(12)
      .max(128)
      .refine(isStrongPassword, 'Password is too weak'),
    verificationCode: z.string().trim().regex(/^\d{6}$/),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;