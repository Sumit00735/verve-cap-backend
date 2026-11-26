import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../core/config/config.module';
import { AppConfigService } from '../../core/config/config.service';
import { MAIL_PORT } from './mail.port';
import { NoopMailAdapter } from './noop-mail.adapter';
import { SmtpMailAdapter } from './smtp-mail.adapter';

@Module({
  imports: [AppConfigModule],
  providers: [
    NoopMailAdapter,
    SmtpMailAdapter,
    {
      provide: MAIL_PORT,
      inject: [AppConfigService, NoopMailAdapter, SmtpMailAdapter],
      useFactory: (
        config: AppConfigService,
        noop: NoopMailAdapter,
        smtp: SmtpMailAdapter,
      ) => {
        return config.env.MAIL_TRANSPORT === 'smtp' ? smtp : noop;
      },
    },
  ],
  exports: [MAIL_PORT],
})
export class MailIntegrationModule {}
