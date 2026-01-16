import { injectable } from 'inversify';
import {
  Interceptor,
  InterceptorTransformObject,
} from '@inversifyjs/http-core';
import Express from 'express';

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
    console.log('GLOBAL INTERCEPTOR');

    const transform = await next();

    transform.push((data) => ({
      status: 'success',
      path: request.originalUrl,
      method: request.method,
      data,
    }));
  }
}
