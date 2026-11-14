import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { configureNestApp } from './bootstrap';
import { AppConfigService } from './core/config/config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true }),
    { bufferLogs: true },
  );

  await configureNestApp(app);

  const config = app.get(AppConfigService);
  await app.listen(config.port, '127.0.0.1');
}

void bootstrap();