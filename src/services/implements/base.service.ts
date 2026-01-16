import {
  IBaseRepository,
  IPaginationResult,
  IQueryOptions
} from '@repositories/contracts/base-repository.interface'
import {
  FindOptionsWhere,
  FindManyOptions,
  FindOneOptions,
  DeepPartial,
  UpdateResult,
  DeleteResult,
  SaveOptions,
  RemoveOptions,
  ObjectLiteral,
  SelectQueryBuilder,
  QueryRunner,
  FindOptionsRelations
} from 'typeorm'
import { IBaseService } from '@services/contracts/base.service.interface'
import ConflictException from '@exceptions/conflict-exception'

export default abstract class BaseService<T extends ObjectLiteral> implements IBaseService<T> {
  protected repository: IBaseRepository<T>

  constructor(repository: IBaseRepository<T>) {
    this.repository = repository
  }

  /** @inheritdoc */
  create(entityData: DeepPartial<T>): T {
    return this.repository.create(entityData)
  }

  /** @inheritdoc */
  async save(entity: T, options?: SaveOptions): Promise<T> {
    return await this.repository.save(entity, options)
  }

  /** @inheritdoc */
  async saveMany(entities: T[], options?: SaveOptions): Promise<T[]> {
    return await this.repository.saveMany(entities, options)
  }

  /** @inheritdoc */
  async findById(id: string | number): Promise<T | null> {
    return await this.repository.findById(id)
  }

  /** @inheritdoc */
  async findByIdOrFail(id: string | number): Promise<T> {
    const entity = await this.repository.findById(id)
    if (!entity) {
      throw new ConflictException(`Entity with id ${id} not found`)
    }
    return entity
  }

  /** @inheritdoc */
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return await this.repository.findOne(options)
  }

  /** @inheritdoc */
  async findOneOrFail(options: FindOneOptions<T>): Promise<T> {
    const entity = await this.repository.findOne(options)
    if (!entity) {
      throw new ConflictException('Entity not found')
    }
    return entity
  }

  /** @inheritdoc */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.findAll(options)
  }

  /** @inheritdoc */
  async findBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T[]> {
    return await this.repository.findBy(where)
  }

  /** @inheritdoc */
  async findOneBy(where: FindOptionsWhere<T>): Promise<T | null> {
    return await this.repository.findOneBy(where)
  }

  /** @inheritdoc */
  async paginate(options: IQueryOptions<T>): Promise<IPaginationResult<T>> {
    return await this.repository.paginate(options)
  }

  /** @inheritdoc */
  async count(options?: FindManyOptions<T>): Promise<number> {
    return await this.repository.count(options)
  }

  /** @inheritdoc */
  async countBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<number> {
    return await this.repository.countBy(where)
  }

  /** @inheritdoc */
  async update(
    criteria: string | number | FindOptionsWhere<T>,
    partialEntity: DeepPartial<T>
  ): Promise<UpdateResult> {
    return await this.repository.update(criteria, partialEntity)
  }

  /** @inheritdoc */
  async updateMany(
    criteria: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    partialEntity: DeepPartial<T>
  ): Promise<UpdateResult> {
    return await this.repository.updateMany(criteria, partialEntity)
  }

  /** @inheritdoc */
  async updateById(id: string | number, partialEntity: DeepPartial<T>): Promise<T> {
    const updateResult = await this.repository.update(id, partialEntity)
    if (!updateResult.affected) {
      throw new ConflictException(`Entity with id ${id} not found`)
    }
    return await this.findByIdOrFail(id)
  }

  /** @inheritdoc */
  async delete(criteria: string | number | FindOptionsWhere<T>): Promise<DeleteResult> {
    return await this.repository.delete(criteria)
  }

  /** @inheritdoc */
  async deleteMany(criteria: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<DeleteResult> {
    return await this.repository.deleteMany(criteria)
  }

  /** @inheritdoc */
  async deleteById(id: string | number): Promise<boolean> {
    const deleteResult = await this.repository.delete(id)
    if (!deleteResult.affected) {
      throw new ConflictException(`Entity with id ${id} not found`)
    }
    return true
  }

  /** @inheritdoc */
  async softDelete(criteria: string | number | FindOptionsWhere<T>): Promise<UpdateResult> {
    return await this.repository.softDelete(criteria)
  }

  /** @inheritdoc */
  async restore(criteria: string | number | FindOptionsWhere<T>): Promise<UpdateResult> {
    return await this.repository.restore(criteria)
  }

  /** @inheritdoc */
  async remove(entity: T, options?: RemoveOptions): Promise<T> {
    return await this.repository.remove(entity, options)
  }

  /** @inheritdoc */
  async removeMany(entities: T[], options?: RemoveOptions): Promise<T[]> {
    return await this.repository.removeMany(entities, options)
  }

  /** @inheritdoc */
  async exists(options: FindOneOptions<T>): Promise<boolean> {
    return await this.repository.exists(options)
  }

  /** @inheritdoc */
  async existsBy(where: FindOptionsWhere<T>): Promise<boolean> {
    return await this.repository.existsBy(where)
  }

  /** @inheritdoc */
  createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias)
  }

  /** @inheritdoc */
  async upsert(
    entityOrEntities: DeepPartial<T> | DeepPartial<T>[],
    conflictPathsOrOptions:
      | string[]
      | {
          conflictPaths: string[]
          skipUpdateIfNoValuesChanged?: boolean
        }
  ): Promise<UpdateResult> {
    return await this.repository.upsert(entityOrEntities, conflictPathsOrOptions)
  }

  /** @inheritdoc */
  withTransaction(queryRunner: QueryRunner): IBaseService<T> {
    const transactionalRepository = this.repository.withTransaction(queryRunner)
    return new (this.constructor as new (repository: IBaseRepository<T>) => this)(
      transactionalRepository
    )
  }

  /** @inheritdoc */
  async findWithRelations(
    relations: FindOptionsRelations<T>,
    where?: FindOptionsWhere<T>
  ): Promise<T[]> {
    return await this.repository.findWithRelations(relations, where)
  }

  /** @inheritdoc */
  async findOneWithRelations(
    relations: FindOptionsRelations<T>,
    where?: FindOptionsWhere<T>
  ): Promise<T | null> {
    return await this.repository.findOneWithRelations(relations, where)
  }

  /** @inheritdoc */
  async sum(columnName: keyof T, where?: FindOptionsWhere<T>): Promise<number> {
    return await this.repository.sum(columnName, where)
  }

  /** @inheritdoc */
  async average(columnName: keyof T, where?: FindOptionsWhere<T>): Promise<number> {
    return await this.repository.average(columnName, where)
  }

  /** @inheritdoc */
  async minimum(columnName: keyof T, where?: FindOptionsWhere<T>): Promise<number> {
    return await this.repository.minimum(columnName, where)
  }

  /** @inheritdoc */
  async maximum(columnName: keyof T, where?: FindOptionsWhere<T>): Promise<number> {
    return await this.repository.maximum(columnName, where)
  }

  /** @inheritdoc */
  async query<R = T[]>(sql: string, parameters?: ObjectLiteral[]): Promise<R> {
    return await this.repository.query<R>(sql, parameters)
  }

  /** @inheritdoc */
  getRepository(): IBaseRepository<T> {
    return this.repository
  }
}
