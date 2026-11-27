export const emailTemplateKeys = [
  'registration_verify_code',
  'registration_received',
  'account_approved',
  'account_rejected',
  'password_reset',
] as const;

export type EmailTemplateKey = (typeof emailTemplateKeys)[number];
