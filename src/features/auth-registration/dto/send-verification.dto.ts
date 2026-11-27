import { z } from 'zod';

export const sendVerificationSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
  })
  .strict();

export type SendVerificationInput = z.infer<typeof sendVerificationSchema>;