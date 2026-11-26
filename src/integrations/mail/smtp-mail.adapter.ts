import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { AppConfigService } from '../../core/config/config.service';
import type { MailPort } from './mail.port';
import type { OutgoingMail } from './mail.types';

@Injectable()
export class SmtpMailAdapter implements MailPort {
  private readonly transporter: Transporter;

  constructor(private readonly config: AppConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.env.MAIL_SMTP_HOST,
      port: config.env.MAIL_SMTP_PORT,
      secure: false,
    });
  }

  async send(message: OutgoingMail): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.env.MAIL_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  }
}
