import { ObjectLiteral } from 'typeorm';
import {
  FilterStrategy,
  FilterStrategyContext,
} from '../filter-strategy.interface';
import { NULL_OPERATORS, SqlOperator } from '@constants/sql';

export class NullFilterStrategy<
  E extends ObjectLiteral,
> implements FilterStrategy<E> {
  public supports(operator: SqlOperator): boolean {
    return NULL_OPERATORS.has(operator);
  }

  public apply({ qb, column, operator }: FilterStrategyContext<E>): void {
    qb.andWhere(`${column} ${operator}`);
  }
}
