import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import logger from '@config/logging';
import { config } from '@config/app';
import { ClassValidationPipe } from '@inversifyjs/class-validation';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { HttpErrorFilter } from '@filters/http-error-filter';

import { establishDatabaseConnection } from './database';
import { container } from './container';
import { TransformInterceptor } from '@interceptors/transform-interceptor';

async function bootstrap(): Promise<void> {
  const server: express.Application = express();

  server.use(cors());
  server.use(helmet());
  server.use(compression());

  const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
  );

  adapter.useGlobalInterceptors(TransformInterceptor);
  adapter.useGlobalFilters(InversifyValidationErrorFilter, HttpErrorFilter);
  adapter.useGlobalPipe(new ClassValidationPipe());

  await establishDatabaseConnection();
  const application = await adapter.build();

  application.listen(config.app.port, () => {
    const { host, port, env } = config.app;
    logger.info('🚀 Application started successfully');
    logger.info(`🌐 Environment : ${env}`);
    logger.info(`📡 Listening   : ${host}:${port}`);
  });
}

bootstrap();
