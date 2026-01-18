import { HttpException } from '@exceptions';
import { NOT_FOUND } from '@constants';

export class NotFoundException extends HttpException {
  constructor(message = 'Not Found Exception', status = NOT_FOUND) {
    super({
      message,
      statusCode: status,
      code: 'NOT_FOUND',
    });
  }
}
