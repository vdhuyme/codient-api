import { ARRAY_OPERATORS, SqlOperator } from '@constants';
import { FilterStrategy, FilterStrategyContext } from '@repositories/filters';
import { isEmptyArray } from '@utils';
import { ObjectLiteral } from 'typeorm';

export class ArrayFilterStrategy<
  E extends ObjectLiteral,
> implements FilterStrategy<E> {
  public supports(operator: SqlOperator): boolean {
    return ARRAY_OPERATORS.has(operator);
  }

  public apply({
    qb,
    column,
    operator,
    filter,
    paramName,
  }: FilterStrategyContext<E>): void {
    const values = this.parseArrayValue(filter.value);
    if (isEmptyArray(values)) {
      qb.andWhere('1 = 0');
      return;
    }

    qb.andWhere(`${column} ${operator} (:...${paramName})`, {
      [paramName]: values,
    });
  }

  private parseArrayValue(value: string): string[] {
    return value
      ? value
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
      : [];
  }
}
