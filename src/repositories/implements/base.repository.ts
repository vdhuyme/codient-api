import { ObjectLiteral, Repository } from 'typeorm'

export default abstract class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
  public constructor(public readonly repository: Repository<T>) {
    super(repository.target, repository.manager, repository.queryRunner)
  }
}
