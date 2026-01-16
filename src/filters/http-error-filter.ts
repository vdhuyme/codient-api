import HttpException from '@exceptions/http.exception';
import {
  CatchError,
  ErrorFilter,
  BadRequestHttpResponse,
} from '@inversifyjs/http-core';

@CatchError(HttpException)
export class HttpErrorFilter implements ErrorFilter<HttpException> {
  public catch(error: HttpException): void {
    throw new BadRequestHttpResponse(
      { message: error.message },
      error.message,
      {
        cause: error,
      },
    );
  }
}
