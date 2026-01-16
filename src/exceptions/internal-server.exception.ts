import HttpException from '@exceptions/http.exception';
import { INTERNAL_SERVER_ERROR } from '@constants/http.status.code';

export default class InternalServerException extends HttpException {
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
