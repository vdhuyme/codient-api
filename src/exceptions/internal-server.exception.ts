import { HttpException } from '@exceptions';
import { INTERNAL_SERVER_ERROR } from '@constants';

export class InternalServerException extends HttpException {
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
