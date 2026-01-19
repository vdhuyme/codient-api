import { CONFLICT } from '@constants';
import { DomainException } from '@exceptions/domain.exception';

export class ConflictException extends DomainException {
  constructor(message = 'Conflict Exception', status = CONFLICT) {
    super({
      message,
      statusCode: status,
      code: 'CONFLICT',
    });
  }
}
