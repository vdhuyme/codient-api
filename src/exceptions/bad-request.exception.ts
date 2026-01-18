import { HttpException } from '@exceptions';
import { BAD_REQUEST } from '@constants';

export class BadRequestException extends HttpException {
  constructor(message = 'BadRequest Exception', status = BAD_REQUEST) {
    super({
      message,
      statusCode: status,
      code: 'BAD_REQUEST',
    });
  }
}
