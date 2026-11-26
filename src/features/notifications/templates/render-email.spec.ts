import { renderEmail } from './render-email';

describe('renderEmail', () => {
  it('renders registration received', () => {
    const mail = renderEmail('registration_received', {
      name: 'Ada',
      email: 'ada@example.com',
    });
    expect(mail.subject).toContain('registration');
    expect(mail.text).toContain('Ada');
  });

  it('renders password reset with link', () => {
    const mail = renderEmail('password_reset', {
      name: 'Ada',
      email: 'ada@example.com',
      resetUrl: 'http://127.0.0.1:3000/reset-password?token=abc',
    });
    expect(mail.text).toContain('abc');
  });
});
