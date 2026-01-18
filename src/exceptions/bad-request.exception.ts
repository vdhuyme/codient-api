import { BAD_REQUEST } from '@constants';
import { DomainException } from './domain.exception';

export class BadRequestException extends DomainException {
  constructor(message = 'BadRequest Exception', status = BAD_REQUEST) {
    super({
      message,
      statusCode: status,
      code: 'BAD_REQUEST',
    });
  }
}
