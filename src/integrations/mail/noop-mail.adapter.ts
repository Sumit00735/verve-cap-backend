import { Injectable } from '@nestjs/common';
import type { MailPort } from './mail.port';
import type { OutgoingMail } from './mail.types';

@Injectable()
export class NoopMailAdapter implements MailPort {
  async send(message: OutgoingMail): Promise<void> {
    void message;
  }
}
