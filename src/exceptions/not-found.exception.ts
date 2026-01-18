import { DomainException } from './domain.exception';
import { NOT_FOUND } from '@constants';

export class NotFoundException extends DomainException {
  constructor(message = 'Not Found Exception', status = NOT_FOUND) {
    super({
      message,
      statusCode: status,
      code: 'NOT_FOUND',
    });
  }
}
