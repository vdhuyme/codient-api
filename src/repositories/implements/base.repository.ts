import {
  IBaseRepository,
  IPaginationResult,
  IQueryOptions
} from '@repositories/contracts/base.repository.interface'
import {
  Repository,
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
  EntityTarget,
  DataSource,
  QueryRunner,
  FindOptionsRelations,
  EntityMetadata,
  FindOptionsOrder
} from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

export default abstract class BaseRepository<
  T extends ObjectLiteral
> implements IBaseRepository<T> {
  protected repository: Repository<T>
  protected metadata: EntityMetadata
  protected dataSource: DataSource
  protected queryRunner?: QueryRunner

  /**
   * Constructs a new BaseRepository.
   * @param {EntityTarget<T>} entity - The entity class.
   * @param {DataSource} dataSource - TypeORM data source.
   * @param {QueryRunner} [queryRunner] - Optional query runner for transactions.
   * @example
   * const repo = new UserRepository(User, dataSource)
   */
  constructor(entity: EntityTarget<T>, dataSource: DataSource, queryRunner?: QueryRunner) {
    this.dataSource = dataSource
    this.queryRunner = queryRunner

    if (queryRunner) {
      this.repository = queryRunner.manager.getRepository(entity)
    } else {
      this.repository = dataSource.getRepository(entity)
    }
    this.metadata = dataSource.getMetadata(entity)
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
    return await this.repository.save(entities, options)
  }

  /** @inheritdoc */
  async findById(id: string | number): Promise<T | null> {
    return await this.repository.findOneBy({ id } as unknown as FindOptionsWhere<T>)
  }

  /** @inheritdoc */
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return await this.repository.findOne(options)
  }

  /** @inheritdoc */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options)
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
    const { page = 1, limit = 50, sortBy, orderBy, ...rest } = options
    const skip = (page - 1) * limit

    const orderOption: FindOptionsOrder<T> | undefined =
      sortBy && orderBy
        ? ({ [sortBy]: orderBy.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' } as FindOptionsOrder<T>)
        : undefined

    const [items, totalItems] = await this.repository.findAndCount({
      ...rest,
      order: orderOption,
      skip,
      take: limit
    })

    const totalPages = Math.ceil(totalItems / limit)

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        from: totalItems === 0 ? 0 : skip + 1,
        to: Math.min(skip + items.length, totalItems),
        nextPage: page < totalPages,
        previousPage: page > 1
      }
    }
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
    return await this.repository.update(criteria, partialEntity as QueryDeepPartialEntity<T>)
  }

  /** @inheritdoc */
  async updateMany(
    criteria: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    partialEntity: DeepPartial<T>
  ): Promise<UpdateResult> {
    return await this.repository.update(criteria, partialEntity as QueryDeepPartialEntity<T>)
  }

  /** @inheritdoc */
  async delete(criteria: string | number | FindOptionsWhere<T>): Promise<DeleteResult> {
    return await this.repository.delete(criteria)
  }

  /** @inheritdoc */
  async deleteMany(criteria: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<DeleteResult> {
    return await this.repository.delete(criteria)
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
    return await this.repository.remove(entities, options)
  }

  /** @inheritdoc */
  async exists(options: FindOneOptions<T>): Promise<boolean> {
    const entity = await this.repository.findOne(options)
    return entity !== null
  }

  /** @inheritdoc */
  async existsBy(where: FindOptionsWhere<T>): Promise<boolean> {
    const entity = await this.repository.findOneBy(where)
    return entity !== null
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
    return await this.repository.upsert(
      entityOrEntities as QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
      conflictPathsOrOptions
    )
  }

  /** @inheritdoc */
  withTransaction(queryRunner: QueryRunner): IBaseRepository<T> {
    const EntityClass = this.repository.target
    return new (this.constructor as new (
      entity: EntityTarget<T>,
      dataSource: DataSource,
      queryRunner?: QueryRunner
    ) => this)(EntityClass, this.dataSource, queryRunner)
  }

  /** @inheritdoc */
  async findWithRelations(
    relations: FindOptionsRelations<T>,
    where?: FindOptionsWhere<T>
  ): Promise<T[]> {
    return await this.repository.find({
      relations,
      where
    })
  }

  /** @inheritdoc */
  async findOneWithRelations(
    relations: FindOptionsRelations<T>,
    where?: FindOptionsWhere<T>
  ): Promise<T | null> {
    return await this.repository.findOne({
      relations,
      where
    })
  }

  /** @inheritdoc */
  async sum(columnName: keyof T, where?: FindOptionsWhere<T>): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('entity')
      .select(`SUM(entity.${String(columnName)})`, 'sum')
      .where(where ? where : '1=1')
      .getRawOne()

    return parseFloat(result?.sum) || 0
  }

  /** @inheritdoc */
  async average(columnName: keyof T, where?: FindOptionsWhere<T>): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('entity')
      .select(`AVG(entity.${String(columnName)})`, 'avg')
      .where(where ? where : '1=1')
      .getRawOne()

    return parseFloat(result?.avg) || 0
  }

  /** @inheritdoc */
  async minimum(columnName: keyof T, where?: FindOptionsWhere<T>): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('entity')
      .select(`MIN(entity.${String(columnName)})`, 'min')
      .where(where ? where : '1=1')
      .getRawOne()

    return parseFloat(result?.min) || 0
  }

  /** @inheritdoc */
  async maximum(columnName: keyof T, where?: FindOptionsWhere<T>): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('entity')
      .select(`MAX(entity.${String(columnName)})`, 'max')
      .where(where ? where : '1=1')
      .getRawOne()

    return parseFloat(result?.max) || 0
  }

  /** @inheritdoc */
  async query<R = T[]>(sql: string, parameters?: ObjectLiteral[]): Promise<R> {
    return await this.repository.query(sql, parameters)
  }

  /** @inheritdoc */
  getRepository(): Repository<T> {
    return this.repository
  }

  /** @inheritdoc */
  getEntityMetaData(): EntityMetadata {
    return this.metadata
  }
}
