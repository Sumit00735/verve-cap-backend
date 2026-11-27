import { UserProfession } from '@prisma/client';

export const registrationProfessionLabels: Record<UserProfession, string> = {
  CA: 'Chartered Accountant (CA)',
  CS: 'Company Secretary (CS)',
  LAWYER: 'Lawyer / Advocate',
  COMPANY_REPRESENTATIVE: 'Company representative',
  INVESTMENT_BANKER: 'Investment banker',
  REVIEWER: 'Reviewer / auditor',
  INVESTOR: 'Investor',
  OTHER: 'Other',
};