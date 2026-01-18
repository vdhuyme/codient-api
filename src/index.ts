import 'dotenv/config';
import 'reflect-metadata';
import { logger, config } from '@config';
import { ClassValidationPipe } from '@inversifyjs/class-validation';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { DomainErrorFilter } from '@filters';
import Express from 'express';

import { database } from './data-source';
import { container } from './container';
import { TransformInterceptor } from '@interceptors';

async function bootstrap(): Promise<void> {
  const adapter = new InversifyExpressHttpAdapter(container, {
    logger: true,
    useJson: true,
    useUrlEncoded: true,
  });

  adapter.useGlobalInterceptors(TransformInterceptor);
  adapter.useGlobalFilters(InversifyValidationErrorFilter, DomainErrorFilter);
  adapter.useGlobalPipe(new ClassValidationPipe());

  const app: Express.Application = await adapter.build();
  await database();

  app.listen(config.app.port, () => {
    const { host, port, env } = config.app;
    logger.info('🚀 Application started successfully');
    logger.info(`🌐 Environment : ${env}`);
    logger.info(`📡 Listening   : ${host}:${port}`);
  });
}

void bootstrap();
