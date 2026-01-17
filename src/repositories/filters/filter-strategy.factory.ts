import { ObjectLiteral, Repository } from 'typeorm';
import { FilterStrategy } from './filter-strategy.interface';
import { FilterValueSanitizer } from './value-sanitizer';
import { NullFilterStrategy } from './strategies/null-filter.strategy';
import { ArrayFilterStrategy } from './strategies/array-filter.strategy';
import { StringFilterStrategy } from './strategies/string-filter.strategy';
import { ComparisonFilterStrategy } from './strategies/comparison-filter.strategy';
import { SqlOperator } from '@constants/sql';

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
