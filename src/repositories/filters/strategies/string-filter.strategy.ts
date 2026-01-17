import { ObjectLiteral } from 'typeorm';
import {
  FilterStrategy,
  FilterStrategyContext,
} from '../filter-strategy.interface';
import { SqlOperator, STRING_MATCH_OPERATORS } from '@constants/sql';

export class StringFilterStrategy<
  E extends ObjectLiteral,
> implements FilterStrategy<E> {
  public supports(operator: SqlOperator): boolean {
    return STRING_MATCH_OPERATORS.has(operator);
  }

  public apply({
    qb,
    column,
    operator,
    filter,
    paramName,
  }: FilterStrategyContext<E>): void {
    qb.andWhere(`${column} ${operator} :${paramName}`, {
      [paramName]: `%${filter.value ?? ''}%`,
    });
  }
}
