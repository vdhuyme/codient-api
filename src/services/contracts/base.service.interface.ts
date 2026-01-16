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

export interface IBaseService<T extends ObjectLiteral> {
  /**
   * Creates a new entity instance from the provided data.
   * @param {DeepPartial<T>} entityData - Partial entity data.
   * @returns {T} The new entity instance.
   */
  create(entityData: DeepPartial<T>): T

  /**
   * Saves (inserts or updates) an entity.
   * @param {T} entity - The entity to save.
   * @param {SaveOptions} [options] - Optional save options.
   * @returns {Promise<T>} The saved entity.
   */
  save(entity: T, options?: SaveOptions): Promise<T>

  /**
   * Saves multiple entities at once.
   * @param {T[]} entities - Array of entities.
   * @param {SaveOptions} [options] - Optional save options.
   * @returns {Promise<T[]>} The saved entities.
   */
  saveMany(entities: T[], options?: SaveOptions): Promise<T[]>

  /**
   * Finds an entity by its primary key.
   * @param {string|number} id - The entity's primary key.
   * @returns {Promise<T|null>} The found entity or null.
   */
  findById(id: string | number): Promise<T | null>

  /**
   * Finds an entity by its primary key or throws an error if not found.
   * @param {string|number} id - The entity's primary key.
   * @returns {Promise<T>} The found entity.
   * @throws {Error} If entity is not found.
   */
  findByIdOrFail(id: string | number): Promise<T>

  /**
   * Finds a single entity matching the given options.
   * @param {FindOneOptions<T>} options - Find options.
   * @returns {Promise<T|null>} The found entity or null.
   */
  findOne(options: FindOneOptions<T>): Promise<T | null>

  /**
   * Finds a single entity matching the given options or throws an error.
   * @param {FindOneOptions<T>} options - Find options.
   * @returns {Promise<T>} The found entity.
   * @throws {Error} If entity is not found.
   */
  findOneOrFail(options: FindOneOptions<T>): Promise<T>

  /**
   * Finds all entities matching the options.
   * @param {FindManyOptions<T>} [options] - Find options.
   * @returns {Promise<T[]>} Array of entities.
   */
  findAll(options?: FindManyOptions<T>): Promise<T[]>

  /**
   * Finds entities matching the given where condition(s).
   * @param {FindOptionsWhere<T>|FindOptionsWhere<T>[]} where - Where condition(s).
   * @returns {Promise<T[]>} Array of entities.
   */
  findBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T[]>

  /**
   * Finds a single entity matching the where condition.
   * @param {FindOptionsWhere<T>} where - Where condition.
   * @returns {Promise<T|null>} The found entity or null.
   */
  findOneBy(where: FindOptionsWhere<T>): Promise<T | null>

  /**
   * Finds entities with pagination support.
   * @param {IQueryOptions<T>} options - Query and pagination options.
   * @returns {Promise<IPaginationResult<T>>} Paginated result.
   */
  paginate(options: IQueryOptions<T>): Promise<IPaginationResult<T>>

  /**
   * Counts entities matching the options.
   * @param {FindManyOptions<T>} [options] - Find options.
   * @returns {Promise<number>} The count.
   */
  count(options?: FindManyOptions<T>): Promise<number>

  /**
   * Counts entities matching the where condition(s).
   * @param {FindOptionsWhere<T>|FindOptionsWhere<T>[]} where - Where condition(s).
   * @returns {Promise<number>} The count.
   */
  countBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<number>

  /**
   * Updates entities matching the criteria.
   * @param {string|number|FindOptionsWhere<T>} criteria - Criteria to match.
   * @param {DeepPartial<T>} partialEntity - Partial entity data.
   * @returns {Promise<UpdateResult>} Update result.
   */
  update(
    criteria: string | number | FindOptionsWhere<T>,
    partialEntity: DeepPartial<T>
  ): Promise<UpdateResult>

  /**
   * Updates multiple entities matching the criteria.
   * @param {FindOptionsWhere<T>|FindOptionsWhere<T>[]} criteria - Criteria to match.
   * @param {DeepPartial<T>} partialEntity - Partial entity data.
   * @returns {Promise<UpdateResult>} Update result.
   */
  updateMany(
    criteria: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    partialEntity: DeepPartial<T>
  ): Promise<UpdateResult>

  /**
   * Updates an entity by ID.
   * @param {string|number} id - Entity ID.
   * @param {DeepPartial<T>} partialEntity - Partial entity data.
   * @returns {Promise<T>} The updated entity.
   * @throws {Error} If entity is not found.
   */
  updateById(id: string | number, partialEntity: DeepPartial<T>): Promise<T>

  /**
   * Deletes entities matching the criteria.
   * @param {string|number|FindOptionsWhere<T>} criteria - Criteria to match.
   * @returns {Promise<DeleteResult>} Delete result.
   */
  delete(criteria: string | number | FindOptionsWhere<T>): Promise<DeleteResult>

  /**
   * Deletes multiple entities.
   * @param {FindOptionsWhere<T>|FindOptionsWhere<T>[]} criteria - Criteria to match.
   * @returns {Promise<DeleteResult>} Delete result.
   */
  deleteMany(criteria: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<DeleteResult>

  /**
   * Deletes an entity by ID.
   * @param {string|number} id - Entity ID.
   * @returns {Promise<boolean>} True if deleted successfully.
   * @throws {Error} If entity is not found.
   */
  deleteById(id: string | number): Promise<boolean>

  /**
   * Soft-deletes entities (sets a deleted flag/date).
   * @param {string|number|FindOptionsWhere<T>} criteria - Criteria to match.
   * @returns {Promise<UpdateResult>} Update result.
   */
  softDelete(criteria: string | number | FindOptionsWhere<T>): Promise<UpdateResult>

  /**
   * Restores soft-deleted entities.
   * @param {string|number|FindOptionsWhere<T>} criteria - Criteria to match.
   * @returns {Promise<UpdateResult>} Update result.
   */
  restore(criteria: string | number | FindOptionsWhere<T>): Promise<UpdateResult>

  /**
   * Removes a single entity instance.
   * @param {T} entity - Entity to remove.
   * @param {RemoveOptions} [options] - Remove options.
   * @returns {Promise<T>} Removed entity.
   */
  remove(entity: T, options?: RemoveOptions): Promise<T>

  /**
   * Removes multiple entity instances.
   * @param {T[]} entities - Entities to remove.
   * @param {RemoveOptions} [options] - Remove options.
   * @returns {Promise<T[]>} Removed entities.
   */
  removeMany(entities: T[], options?: RemoveOptions): Promise<T[]>

  /**
   * Checks if any entity exists matching the options.
   * @param {FindOneOptions<T>} options - Find options.
   * @returns {Promise<boolean>} True if exists.
   */
  exists(options: FindOneOptions<T>): Promise<boolean>

  /**
   * Checks if any entity exists matching the where condition.
   * @param {FindOptionsWhere<T>} where - Where condition.
   * @returns {Promise<boolean>} True if exists.
   */
  existsBy(where: FindOptionsWhere<T>): Promise<boolean>

  /**
   * Returns a TypeORM query builder for advanced queries.
   * @param {string} [alias] - Table alias.
   * @returns {SelectQueryBuilder<T>} Query builder.
   */
  createQueryBuilder(alias?: string): SelectQueryBuilder<T>

  /**
   * Inserts or updates entities based on conflict paths.
   * @param {DeepPartial<T>|DeepPartial<T>[]} entityOrEntities - Entity/entities to upsert.
   * @param {string[]|Object} conflictPathsOrOptions - Conflict paths or options.
   * @returns {Promise<UpdateResult>} Upsert result.
   */
  upsert(
    entityOrEntities: DeepPartial<T> | DeepPartial<T>[],
    conflictPathsOrOptions:
      | string[]
      | {
          conflictPaths: string[]
          skipUpdateIfNoValuesChanged?: boolean
        }
  ): Promise<UpdateResult>

  /**
   * Returns a service instance bound to the given transaction.
   * @param {QueryRunner} queryRunner - Query runner.
   * @returns {IBaseService<T>} Transactional service.
   */
  withTransaction(queryRunner: QueryRunner): IBaseService<T>

  /**
   * Finds entities with specified relations loaded.
   * @param {FindOptionsRelations<T>} relations - Relations to load.
   * @param {FindOptionsWhere<T>} [where] - Where condition.
   * @returns {Promise<T[]>} Entities with relations.
   */
  findWithRelations(relations: FindOptionsRelations<T>, where?: FindOptionsWhere<T>): Promise<T[]>

  /**
   * Finds a single entity with specified relations loaded.
   * @param {FindOptionsRelations<T>} relations - Relations to load.
   * @param {FindOptionsWhere<T>} [where] - Where condition.
   * @returns {Promise<T|null>} Entity with relations or null.
   */
  findOneWithRelations(
    relations: FindOptionsRelations<T>,
    where?: FindOptionsWhere<T>
  ): Promise<T | null>

  /**
   * Returns the sum of a column.
   * @param {keyof T} columnName - Column to sum.
   * @param {FindOptionsWhere<T>} [where] - Where condition.
   * @returns {Promise<number>} Sum value.
   */
  sum(columnName: keyof T, where?: FindOptionsWhere<T>): Promise<number>

  /**
   * Returns the average of a column.
   * @param {keyof T} columnName - Column to average.
   * @param {FindOptionsWhere<T>} [where] - Where condition.
   * @returns {Promise<number>} Average value.
   */
  average(columnName: keyof T, where?: FindOptionsWhere<T>): Promise<number>

  /**
   * Returns the minimum value of a column.
   * @param {keyof T} columnName - Column to check.
   * @param {FindOptionsWhere<T>} [where] - Where condition.
   * @returns {Promise<number>} Minimum value.
   */
  minimum(columnName: keyof T, where?: FindOptionsWhere<T>): Promise<number>

  /**
   * Returns the maximum value of a column.
   * @param {keyof T} columnName - Column to check.
   * @param {FindOptionsWhere<T>} [where] - Where condition.
   * @returns {Promise<number>} Maximum value.
   */
  maximum(columnName: keyof T, where?: FindOptionsWhere<T>): Promise<number>

  /**
   * Executes a raw SQL query.
   * @template R
   * @param {string} sql - SQL query string.
   * @param {ObjectLiteral[]} [parameters] - Query parameters.
   * @returns {Promise<R>} Query result.
   */
  query<R = T[]>(sql: string, parameters?: ObjectLiteral[]): Promise<R>

  /**
   * Returns the underlying repository.
   * @returns {IBaseRepository<T>} Repository instance.
   */
  getRepository(): IBaseRepository<T>
}
