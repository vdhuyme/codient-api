import { HttpException } from '@exceptions';
import { UNAUTHORIZED } from '@constants';

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized Exception', status = UNAUTHORIZED) {
    super({
      message,
      statusCode: status,
      code: 'UNAUTHORIZED',
    });
  }
}
