import { FilterRule } from '@domain';
import { isNil } from '@utils';
import { ObjectLiteral, Repository } from 'typeorm';

export class ValueTypeValidator<E extends ObjectLiteral> {
  private readonly NULL_RULES = new Set([
    FilterRule.IS_NULL,
    FilterRule.IS_NOT_NULL,
  ]);

  private readonly ARRAY_RULES = new Set([FilterRule.IN, FilterRule.NOT_IN]);

  public constructor(private readonly repository: Repository<E>) {}

  public validate(
    property: string,
    value: string,
    rule: FilterRule,
  ): string | null {
    const shouldSkipValidation =
      this.NULL_RULES.has(rule) || !value || value.trim() === '';

    return shouldSkipValidation
      ? null
      : this.validateValue(property, value, rule);
  }

  private validateValue(
    property: string,
    value: string,
    rule: FilterRule,
  ): string | null {
    const cleanProperty = this.extractPropertyName(property);
    const values = this.ARRAY_RULES.has(rule)
      ? this.parseArrayValue(value)
      : [value];

    const columnType = this.getColumnType(cleanProperty);
    if (isNil(columnType)) {
      return null;
    }

    const invalidValues: string[] = [];

    for (const val of values) {
      if (!this.isValidValueForType(val, columnType)) {
        invalidValues.push(val);
      }
    }

    return invalidValues.length > 0
      ? this.resolveErrorMessage(property, invalidValues, columnType)
      : null;
  }

  private isValidValueForType(value: string, columnType: unknown): boolean {
    if (this.isIntegerType(columnType)) {
      return this.isValidInteger(value);
    }

    if (this.isFloatType(columnType)) {
      return this.isValidNumber(value);
    }

    if (this.isDateType(columnType)) {
      return this.isValidDate(value);
    }

    if (this.isUuidType(columnType)) {
      return this.isValidUuid(value);
    }

    return true;
  }

  private isIntegerType(columnType: unknown): boolean {
    const type = String(columnType).toLowerCase();
    return (
      type.includes('int') ||
      type.includes('integer') ||
      type.includes('smallint') ||
      type.includes('bigint')
    );
  }

  private isFloatType(columnType: unknown): boolean {
    const type = String(columnType).toLowerCase();
    return (
      type.includes('float') ||
      type.includes('double') ||
      type.includes('decimal') ||
      type.includes('numeric')
    );
  }

  private isDateType(columnType: unknown): boolean {
    return (
      columnType === 'date' ||
      columnType === 'datetime' ||
      columnType === 'timestamp' ||
      columnType === Date
    );
  }

  private isUuidType(columnType: unknown): boolean {
    return columnType === 'uuid';
  }

  private isValidInteger(value: string): boolean {
    const num = Number(value);
    return !isNaN(num) && Number.isInteger(num);
  }

  private isValidNumber(value: string): boolean {
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  }

  private isValidDate(value: string): boolean {
    if (/^\d+$/.test(value)) {
      return false;
    }

    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  private isValidUuid(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  private resolveErrorMessage(
    property: string,
    invalidValues: string[],
    columnType: unknown,
  ): string {
    return `Invalid value type for "${property}" (expected ${String(columnType)}): ${invalidValues.join(', ')}`;
  }

  private extractPropertyName(property: string): string {
    return property.includes('.') ? property.split('.')[1] : property;
  }

  private parseArrayValue(value: string): string[] {
    return value
      ? value
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
      : [];
  }

  private getColumnType(property: string): unknown {
    const cleanProperty = this.extractPropertyName(property);
    const columnMeta =
      this.repository.metadata.findColumnWithPropertyName(cleanProperty);
    return columnMeta?.type ?? 'unknown';
  }
}
