import { User } from '@entities';
import { BaseRepository } from '@repositories';
import { injectRepository } from '@decorators';
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
