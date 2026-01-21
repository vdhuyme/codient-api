import { Filtering, Sorting, Pagination, PaginationResult } from '@domain';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import {
  FilterApplier,
  SortApplier,
  PaginationCalculator,
} from '@repositories/services';

export class BaseQueryBuilder<
  T extends ObjectLiteral,
> extends SelectQueryBuilder<T> {
  private filtering?: Filtering[];
  private sorting?: Sorting[];

  public constructor(
    qb: SelectQueryBuilder<T>,
    private readonly filterApplier: FilterApplier<T>,
    private readonly sortApplier: SortApplier<T>,
    private readonly paginationCalculator: PaginationCalculator,
  ) {
    super(qb);
  }

  public filterable(filtering?: Filtering[]): this {
    this.filtering = filtering;
    return this;
  }

  public sortable(sorting?: Sorting[]): this {
    this.sorting = sorting;
    return this;
  }

  public async paginate(pagination: Pagination): Promise<PaginationResult<T>> {
    if (this.filtering?.length) {
      this.filterApplier.applyFilters(this, this.filtering);
    }

    if (this.sorting?.length) {
      this.sortApplier.applySorting(this, this.sorting);
    }

    const { page, limit, offset } = this.paginationCalculator.applyPagination(
      pagination.page,
      pagination.limit,
    );

    this.skip(offset).take(limit);

    const [items, total] = await this.getManyAndCount();

    return this.paginationCalculator.createPaginationResult(
      items,
      total,
      page,
      limit,
    );
  }
}
