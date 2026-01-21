import { BaseQueryBuilder } from '@repositories';
import {
  FilterApplier,
  PaginationCalculator,
  SortApplier,
} from '@repositories/services';
import { ObjectLiteral, QueryRunner, TreeRepository } from 'typeorm';

export abstract class BaseTreeRepository<
  T extends ObjectLiteral,
> extends TreeRepository<T> {
  public override createQueryBuilder(
    alias?: string,
    queryRunner?: QueryRunner,
  ): BaseQueryBuilder<T> {
    const qb = super.createQueryBuilder(alias, queryRunner);

    const filterApplier = new FilterApplier<T>(this, qb.alias);
    const sortApplier = new SortApplier<T>(this, qb.alias);
    const paginationCalculator = new PaginationCalculator();

    return new BaseQueryBuilder<T>(
      qb,
      filterApplier,
      sortApplier,
      paginationCalculator,
    );
  }
}
