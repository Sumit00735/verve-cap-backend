import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { MailPort } from '../../integrations/mail/mail.port';
import { MAIL_PORT } from '../../integrations/mail/mail.port';
import { EmailOutboxService } from './email-outbox.service';

const POLL_MS = 2_000;

@Injectable()
export class EmailQueueWorker implements OnModuleInit, OnModuleDestroy {
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(
    private readonly outbox: EmailOutboxService,
    @Inject(MAIL_PORT) private readonly mail: MailPort,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.tick();
    }, POLL_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async tick(): Promise<void> {
    if (this.running) {
      return;
    }
    this.running = true;
    try {
      let again = true;
      while (again) {
        again = await this.processOne();
      }
    } finally {
      this.running = false;
    }
  }

  private async processOne(): Promise<boolean> {
    const row = await this.outbox.claimPending();
    if (!row) {
      return false;
    }

    try {
      await this.mail.send({
        to: row.toEmail,
        subject: row.subject,
        text: row.bodyText,
        html: row.bodyHtml,
      });
      await this.outbox.markSent(row.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Mail delivery failed';
      await this.outbox.markFailed(row.id, message);
    }
    return true;
  }
}
