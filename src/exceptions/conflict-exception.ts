import { CONFLICT } from '@constants';
import { HttpException } from '@exceptions';

export class ConflictException extends HttpException {
  constructor(message = 'Conflict Exception', status = CONFLICT) {
    super({
      message,
      statusCode: status,
      code: 'CONFLICT',
    });
  }
}
