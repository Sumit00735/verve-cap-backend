import { z } from 'zod';

export const createCompanySchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    cin: z.string().trim().max(21).optional(),
    isin: z.string().trim().max(12).optional(),
    symbol: z.string().trim().max(20).optional(),
  })
  .strict();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
