import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().toLowerCase().email().max(254),
    company: z.string().trim().min(1).max(200),
    contact: z.string().trim().min(5).max(30),
    password: z.string().min(12).max(128),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;