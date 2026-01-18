import { ObjectLiteral } from 'typeorm';
import {
  FilterStrategy,
  FilterStrategyContext,
  FilterValueSanitizer,
} from '@repositories/filters';
import { ARRAY_OPERATORS, SqlOperator } from '@constants/sql';

export class ArrayFilterStrategy<
  E extends ObjectLiteral,
> implements FilterStrategy<E> {
  public constructor(private readonly sanitizer: FilterValueSanitizer<E>) {}

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
    const rawValues = this.parseArrayValue(filter.value ?? '');
    const sanitizedValues = this.sanitizer.sanitize(filter.property, rawValues);

    if (!sanitizedValues.length) {
      qb.andWhere('1 = 0');
      return;
    }

    qb.andWhere(`${column} ${operator} (:...${paramName})`, {
      [paramName]: sanitizedValues,
    });
  }

  private parseArrayValue(value: string): string[] {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
}
