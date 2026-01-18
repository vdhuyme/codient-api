import { ObjectLiteral, Repository } from 'typeorm';
import { SqlOperator } from '@constants/sql';
import { FilterStrategy, FilterValueSanitizer } from '@repositories/filters';
import {
  NullFilterStrategy,
  ArrayFilterStrategy,
  StringFilterStrategy,
  ComparisonFilterStrategy,
} from '@repositories/filters/strategies';

export class FilterStrategyFactory<E extends ObjectLiteral> {
  private readonly strategies: FilterStrategy<E>[];

  public constructor(repository: Repository<E>) {
    const sanitizer = new FilterValueSanitizer(repository);
    this.strategies = [
      new NullFilterStrategy<E>(),
      new ArrayFilterStrategy<E>(sanitizer),
      new StringFilterStrategy<E>(),
      new ComparisonFilterStrategy<E>(),
    ];
  }

  public getStrategy(operator: SqlOperator): FilterStrategy<E> {
    return (
      this.strategies.find((strategy) => strategy.supports(operator)) ??
      this.strategies.at(-1)!
    );
  }
}
