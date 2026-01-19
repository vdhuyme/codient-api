import { DomainException } from '@exceptions/domain.exception';
import { INTERNAL_SERVER_ERROR } from '@constants';

export class InternalServerException extends DomainException {
  constructor(
    message = 'Internal Server Error Exception',
    status = INTERNAL_SERVER_ERROR,
  ) {
    super({
      message,
      statusCode: status,
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}
