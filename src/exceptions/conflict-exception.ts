import { CONFLICT } from '@constants/http.status.code';
import HttpException from '@exceptions/http.exception';

export default class ConflictException extends HttpException {
  constructor(message = 'Conflict Exception', status = CONFLICT) {
    super({
      message,
      statusCode: status,
      code: 'CONFLICT',
    });
  }
}
