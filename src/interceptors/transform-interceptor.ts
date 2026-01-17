import { injectable } from 'inversify';
import { Interceptor } from '@inversifyjs/http-core';
import Express from 'express';

@injectable()
export class TransformInterceptor<T> implements Interceptor<
  Express.Request,
  Express.Response
> {
  public async intercept(
    request: Express.Request,
    response: Express.Response,
    next: () => Promise<any>,
  ): Promise<void> {
    const start = performance.now();
    const transform = await next();
    const end = performance.now();
    const durationMs = Math.round(end - start);

    transform.push((value: any) => {
      return {
        statusCode: response.statusCode,
        timestamp: new Date().toISOString(),
        durationMs,
        path: request.path,
        data: value,
      };
    });
  }
}
