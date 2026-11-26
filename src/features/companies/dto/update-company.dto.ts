import { z } from 'zod';

export const updateCompanySchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    cin: z.string().trim().max(21).nullable().optional(),
    isin: z.string().trim().max(12).nullable().optional(),
    symbol: z.string().trim().max(20).nullable().optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.name !== undefined ||
      value.cin !== undefined ||
      value.isin !== undefined ||
      value.symbol !== undefined,
    { message: 'No fields to update' },
  );

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
