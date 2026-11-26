import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    company: z.string().trim().min(1).max(200),
    contact: z.string().trim().min(5).max(30),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
