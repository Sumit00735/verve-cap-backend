import { Module } from '@nestjs/common';
import { MailIntegrationModule } from '../../integrations/mail/mail.module';
import { EmailOutboxService } from './email-outbox.service';
import { EmailQueueWorker } from './email-queue.worker';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [MailIntegrationModule],
  controllers: [NotificationsController],
  providers: [EmailOutboxService, EmailQueueWorker],
  exports: [EmailOutboxService],
})
export class NotificationsModule {}
