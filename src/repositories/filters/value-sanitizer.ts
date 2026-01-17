import { SanitizedValue } from '@constants/sql';
import { ColumnType, ObjectLiteral, Repository } from 'typeorm';

export class FilterValueSanitizer<E extends ObjectLiteral> {
  private readonly integerTypes = [
    'int',
    'integer',
    'smallint',
    'bigint',
  ] as const;
  private readonly floatTypes = [
    'float',
    'double',
    'decimal',
    'numeric',
  ] as const;

  public constructor(private readonly repository: Repository<E>) {}

  public sanitize(property: string, values: string[]): SanitizedValue[] {
    const columnType = this.getColumnType(property);
    if (!columnType) {
      return values;
    }

    return values
      .map((value) => this.sanitizeSingleValue(value, columnType))
      .filter(
        (value): value is SanitizedValue =>
          value !== null && value !== undefined,
      );
  }

  private getColumnType(property: string): ColumnType | undefined {
    const columnMeta =
      this.repository.metadata.findColumnWithPropertyName(property);
    return columnMeta?.type;
  }

  private sanitizeSingleValue(
    value: string,
    columnType: ColumnType,
  ): SanitizedValue | null {
    if (this.isIntegerType(columnType)) {
      return this.parseInteger(value);
    }

    if (this.isFloatType(columnType)) {
      return this.parseFloat(value);
    }

    if (this.isUuidType(columnType)) {
      return this.parseUuid(value);
    }

    if (this.isDateType(columnType)) {
      return this.parseDate(value);
    }

    return value;
  }

  private isIntegerType(columnType: ColumnType): boolean {
    return this.integerTypes.some((type) => type === columnType);
  }

  private parseInteger(value: string): number | null {
    return /^-?\d+$/.test(value) ? Number(value) : null;
  }

  private isFloatType(columnType: ColumnType): boolean {
    return this.floatTypes.some((type) => type === columnType);
  }

  private parseFloat(value: string): number | null {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private isUuidType(columnType: ColumnType): boolean {
    return columnType === 'uuid';
  }

  private parseUuid(value: string): string | null {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      value,
    )
      ? value
      : null;
  }

  private isDateType(columnType: ColumnType): boolean {
    return columnType === 'date' || columnType === Date;
  }

  private parseDate(value: string): Date | null {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}
