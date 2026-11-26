import type { OutgoingMail } from './mail.types';

export const MAIL_PORT = Symbol('MAIL_PORT');

export interface MailPort {
  send(message: OutgoingMail): Promise<void>;
}
