import { z } from 'zod';

export const verifyCodeSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    verificationCode: z.string().trim().regex(/^\d{6}$/),
  })
  .strict();

export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;