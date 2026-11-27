import { BRAND_NAME } from '../../../core/brand';
import type { EmailTemplateKey } from './template-keys';

export type EmailTemplateContext = {
  name: string;
  email: string;
  resetUrl?: string;
  verificationCode?: string;
};

export type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

export function renderEmail(
  templateKey: EmailTemplateKey,
  context: EmailTemplateContext,
): RenderedEmail {
  const signoff = `— ${BRAND_NAME}`;

  switch (templateKey) {
    case 'registration_verify_code': {
      const code = context.verificationCode;
      if (!code) {
        throw new Error('registration_verify_code requires verificationCode');
      }
      return {
        subject: `Verify your email for ${BRAND_NAME}`,
        text: [
          `Hello ${context.name},`,
          '',
          `Your verification code is ${code}. It expires in 15 minutes.`,
          '',
          'If you did not request this, you can ignore this email.',
          '',
          signoff,
        ].join('\n'),
        html: paragraphEmail(
          `Hello ${escapeHtml(context.name)},`,
          `Your verification code is <strong>${escapeHtml(code)}</strong>. It expires in 15 minutes.`,
          'If you did not request this, you can ignore this email.',
        ),
      };
    }
    case 'registration_received':
      return {
        subject: `We received your ${BRAND_NAME} registration`,
        text: [
          `Hello ${context.name},`,
          '',
          'Thanks for registering. An administrator will review your account shortly.',
          'You will receive another email when your account is approved or declined.',
          '',
          signoff,
        ].join('\n'),
        html: paragraphEmail(
          `Hello ${escapeHtml(context.name)},`,
          'Thanks for registering. An administrator will review your account shortly.',
          'You will receive another email when your account is approved or declined.',
        ),
      };
    case 'account_approved':
      return {
        subject: `Your ${BRAND_NAME} account is approved`,
        text: [
          `Hello ${context.name},`,
          '',
          'Your account has been approved. You can sign in at any time.',
          '',
          signoff,
        ].join('\n'),
        html: paragraphEmail(
          `Hello ${escapeHtml(context.name)},`,
          'Your account has been approved. You can sign in at any time.',
        ),
      };
    case 'account_rejected':
      return {
        subject: `Update on your ${BRAND_NAME} registration`,
        text: [
          `Hello ${context.name},`,
          '',
          'Your registration was not approved at this time.',
          'If you believe this is a mistake, contact your administrator.',
          '',
          signoff,
        ].join('\n'),
        html: paragraphEmail(
          `Hello ${escapeHtml(context.name)},`,
          'Your registration was not approved at this time.',
          'If you believe this is a mistake, contact your administrator.',
        ),
      };
    case 'password_reset':
      if (!context.resetUrl) {
        throw new Error('password_reset requires resetUrl');
      }
      return {
        subject: `Reset your ${BRAND_NAME} password`,
        text: [
          `Hello ${context.name},`,
          '',
          'Use this link to choose a new password (expires in 15 minutes):',
          context.resetUrl,
          '',
          'If you did not request this, you can ignore this email.',
          '',
          signoff,
        ].join('\n'),
        html: paragraphEmail(
          `Hello ${escapeHtml(context.name)},`,
          'Use the link below to choose a new password. It expires in 15 minutes.',
          `<p><a href="${escapeHtml(context.resetUrl)}">Reset password</a></p>`,
          'If you did not request this, you can ignore this email.',
        ),
      };
    default: {
      const _exhaustive: never = templateKey;
      throw new Error(`Unknown template: ${_exhaustive}`);
    }
  }
}

function paragraphEmail(...parts: string[]): string {
  const body = parts.map((part) => `<p>${part}</p>`).join('');
  return `<!DOCTYPE html><html><body>${body}</body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}