import { NULL_OPERATORS, SqlOperator } from '@constants';
import { FilterStrategy, FilterStrategyContext } from '@repositories/filters';
import { ObjectLiteral } from 'typeorm';

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
