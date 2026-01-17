import { Filtering } from '../domain/filterable';
import { Pagination } from '../domain/paginatable';
import { PaginationResult } from '../domain/pagination';
import { Sorting } from '../domain/sortable';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { FilterApplier } from './services/filter-applier';
import { SortApplier } from './services/sort-applier';
import { PaginationCalculator } from './services/pagination-calculator';

interface IBaseRepository<T extends ObjectLiteral> extends Repository<T> {
  paginate(
    pagination: Pagination,
    filtering?: Filtering[],
    sorting?: Sorting[],
  ): Promise<PaginationResult<T>>;
}

export abstract class BaseRepository<T extends ObjectLiteral>
  extends Repository<T>
  implements IBaseRepository<T>
{
  protected readonly alias: string;

  protected readonly filterApplier: FilterApplier<T>;
  protected readonly sortApplier: SortApplier<T>;
  protected readonly paginationCalculator: PaginationCalculator;

  protected constructor(repository: Repository<T>, alias?: string) {
    super(repository.target, repository.manager, repository.queryRunner);

    this.alias = alias ?? repository.metadata.tableName.toLowerCase();

    this.filterApplier = new FilterApplier<T>(this, this.alias);
    this.sortApplier = new SortApplier<T>(this, this.alias);
    this.paginationCalculator = new PaginationCalculator();
  }

  protected applyFiltering(
    qb: SelectQueryBuilder<T>,
    filtering?: Filtering[],
  ): void {
    if (!filtering?.length) return;
    this.filterApplier.applyFilters(qb, filtering);
  }

  protected applySorting(qb: SelectQueryBuilder<T>, sorting?: Sorting[]): void {
    if (!sorting?.length) return;
    this.sortApplier.applySorting(qb, sorting);
  }

  protected applyPagination(
    qb: SelectQueryBuilder<T>,
    pagination: Pagination,
  ): { page: number; limit: number } {
    const { page, limit, offset } = this.paginationCalculator.applyPagination(
      pagination.page,
      pagination.limit,
    );

    qb.skip(offset).take(limit);
    return { page, limit };
  }

  /**
   * @description Paginate the results based on the provided pagination, filtering, and sorting options.
   * @param pagination - The pagination options.
   * @param filtering - The filtering options.
   * @param sorting - The sorting options.
   * @returns A promise that resolves to a PaginationResult containing the paginated items and metadata.
   */
  public async paginate(
    pagination: Pagination,
    filtering?: Filtering[],
    sorting?: Sorting[],
  ): Promise<PaginationResult<T>> {
    const qb = this.createQueryBuilder(this.alias);

    this.applyFiltering(qb, filtering);
    this.applySorting(qb, sorting);
    const { page, limit } = this.applyPagination(qb, pagination);

    const [items, total] = await qb.getManyAndCount();

    return this.paginationCalculator.createPaginationResult(
      items,
      total,
      page,
      limit,
    );
  }
}
