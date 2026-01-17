import { User } from '@entities/user';
import { BaseRepository } from './base-repository';
import { injectRepository } from '@decorators/inject-repository';
import { Repository } from 'typeorm';
import { injectable } from 'inversify';

@injectable()
export class UserRepository extends BaseRepository<User> {
  public constructor(
    @injectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository);
  }
}
