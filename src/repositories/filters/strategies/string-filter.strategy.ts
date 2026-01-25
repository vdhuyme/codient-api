import { SqlOperator, STRING_MATCH_OPERATORS } from '@constants';
import { FilterStrategy, FilterStrategyContext } from '@repositories/filters';
import { ObjectLiteral } from 'typeorm';

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
      [paramName]: `%${filter.value}%`,
    });
  }
}
