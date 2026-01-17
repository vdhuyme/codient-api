import { injectable } from 'inversify';
import {
  Interceptor,
  InterceptorTransformObject,
} from '@inversifyjs/http-core';
import Express from 'express';
import logger from '@config/logging';

@injectable()
export class TransformInterceptor implements Interceptor<
  Express.Request,
  Express.Response
> {
  public async intercept(
    request: Express.Request,
    response: Express.Response,
    next: () => Promise<InterceptorTransformObject>,
  ): Promise<void> {
    const path: string = request.path;

    logger.info(`Incoming Request: ${request.method} ${path}`);

    await next();

    logger.info(`Outgoing Response: ${request.method} ${path}`);
  }
}
