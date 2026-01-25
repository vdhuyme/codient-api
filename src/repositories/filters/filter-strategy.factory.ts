import { SqlOperator } from '@constants';
import { FilterStrategy } from '@repositories/filters';
import {
  ArrayFilterStrategy,
  ComparisonFilterStrategy,
  NullFilterStrategy,
  StringFilterStrategy,
} from '@repositories/filters/strategies';
import { ObjectLiteral } from 'typeorm';

export class FilterStrategyFactory<E extends ObjectLiteral> {
  private readonly strategies: Array<FilterStrategy<E>>;

  public constructor() {
    this.strategies = [
      new NullFilterStrategy<E>(),
      new ArrayFilterStrategy<E>(),
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
