import type { EmailTemplateKey } from './template-keys';

export type EmailTemplateContext = {
  name: string;
  email: string;
  resetUrl?: string;
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
  switch (templateKey) {
    case 'registration_received':
      return {
        subject: 'We received your Verve Cap registration',
        text: [
          `Hello ${context.name},`,
          '',
          'Thanks for registering. An administrator will review your account shortly.',
          'You will receive another email when your account is approved or declined.',
          '',
          '— Verve Cap',
        ].join('\n'),
        html: paragraphEmail(
          `Hello ${escapeHtml(context.name)},`,
          'Thanks for registering. An administrator will review your account shortly.',
          'You will receive another email when your account is approved or declined.',
        ),
      };
    case 'account_approved':
      return {
        subject: 'Your Verve Cap account is approved',
        text: [
          `Hello ${context.name},`,
          '',
          'Your account has been approved. You can sign in at any time.',
          '',
          '— Verve Cap',
        ].join('\n'),
        html: paragraphEmail(
          `Hello ${escapeHtml(context.name)},`,
          'Your account has been approved. You can sign in at any time.',
        ),
      };
    case 'account_rejected':
      return {
        subject: 'Update on your Verve Cap registration',
        text: [
          `Hello ${context.name},`,
          '',
          'Your registration was not approved at this time.',
          'If you believe this is a mistake, contact your administrator.',
          '',
          '— Verve Cap',
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
        subject: 'Reset your Verve Cap password',
        text: [
          `Hello ${context.name},`,
          '',
          'Use this link to choose a new password (expires in 15 minutes):',
          context.resetUrl,
          '',
          'If you did not request this, you can ignore this email.',
          '',
          '— Verve Cap',
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
