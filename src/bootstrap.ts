import { randomUUID } from 'node:crypto';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { AppConfigService } from './core/config/config.service';
import { HttpExceptionFilter } from './core/errors/http-exception.filter';

export async function configureNestApp(
  app: NestFastifyApplication,
): Promise<void> {
  const config = app.get(AppConfigService);
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useGlobalFilters(new HttpExceptionFilter());

  const fastify = app.getHttpAdapter().getInstance();
  await fastify.register(cookie);

  fastify.addHook('onRequest', (request, reply, done) => {
    const incoming = request.headers['x-request-id'];
    const requestId =
      typeof incoming === 'string' && incoming.length > 0
        ? incoming
        : randomUUID();
    (request as typeof request & { requestId: string }).requestId = requestId;
    void reply.header('x-request-id', requestId);
    done();
  });

  await app.register(helmet, {
    contentSecurityPolicy: config.isProduction ? undefined : false,
  });

  if (!config.isProduction) {
    app.enableCors({
      origin: [config.env.APP_ORIGIN],
      credentials: true,
    });
  }

  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'ready'],
  });
}
