import { DomainException } from '@exceptions';
import {
  CatchError,
  ErrorFilter,
  BadRequestHttpResponse,
} from '@inversifyjs/http-core';

@CatchError(DomainException)
export class DomainErrorFilter implements ErrorFilter<DomainException> {
  public catch(error: DomainException): void {
    throw new BadRequestHttpResponse(
      { message: error.message },
      error.message,
      {
        cause: error,
      },
    );
  }
}
