import { DomainException } from './domain.exception';
import { UNAUTHORIZED } from '@constants';

export class UnauthorizedException extends DomainException {
  constructor(message = 'Unauthorized Exception', status = UNAUTHORIZED) {
    super({
      message,
      statusCode: status,
      code: 'UNAUTHORIZED',
    });
  }
}
