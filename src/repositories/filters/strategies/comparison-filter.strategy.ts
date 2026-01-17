import { ObjectLiteral } from 'typeorm';
import {
  FilterStrategy,
  FilterStrategyContext,
} from '../filter-strategy.interface';

export class ComparisonFilterStrategy<
  E extends ObjectLiteral,
> implements FilterStrategy<E> {
  public supports(): boolean {
    return true;
  }

  public apply({
    qb,
    column,
    operator,
    filter,
    paramName,
  }: FilterStrategyContext<E>): void {
    qb.andWhere(`${column} ${operator} :${paramName}`, {
      [paramName]: filter.value,
    });
  }
}
