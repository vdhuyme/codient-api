import { Sorting } from '@domain';
import { BadRequestException } from '@exceptions';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

export class SortApplier<E extends ObjectLiteral> {
  private readonly VALID_DIRECTIONS = ['ASC', 'DESC'] as const;
  private readonly DEFAULT_DIRECTION = 'ASC' as const;

  public constructor(
    private readonly repository: Repository<E>,
    private readonly alias: string,
  ) {}

  public applySorting(
    qb: SelectQueryBuilder<E>,
    sorting: Sorting[] | undefined,
  ): void {
    if (!this.hasSorting(sorting)) {
      return;
    }

    this.validateSorts(sorting!);

    sorting!.forEach((sort: Sorting): void => {
      this.applySingleSort(qb, sort);
    });
  }

  private hasSorting(sorting: Sorting[] | undefined): boolean {
    return Array.isArray(sorting) && sorting.length > 0;
  }

  private validateSorts(sorting: Sorting[]): void {
    const errors: string[] = [];

    sorting.forEach((sort, index) => {
      this.validateColumnExistence(sort.property, errors, index);
    });

    if (errors.length > 0) {
      throw new BadRequestException(
        `Sort validation failed: ${errors.join(', ')}`,
      );
    }
  }

  private validateColumnExistence(
    property: string,
    errors: string[],
    index: number,
  ): void {
    if (!this.isValidColumn(property)) {
      errors.push(
        `Sort ${index}: Property "${property}" is not a valid column`,
      );
    }
  }

  private isValidColumn(property: string): boolean {
    const hasDot = property.includes('.');
    const cleanProperty = hasDot ? property.split('.')[1] : property;

    const columnMeta =
      this.repository.metadata.findColumnWithPropertyName(cleanProperty);

    return columnMeta !== undefined;
  }

  private applySingleSort(qb: SelectQueryBuilder<E>, sort: Sorting): void {
    const column = this.getColumnName(sort.property);
    const direction = this.normalizeDirection(sort.direction);
    qb.addOrderBy(column, direction);
  }

  private getColumnName(property: string): string {
    if (property.includes('.')) {
      return property;
    }
    return `${this.alias}.${property}`;
  }

  private normalizeDirection(direction: string): 'ASC' | 'DESC' {
    const upperDirection = direction.toUpperCase();
    if (this.isValidDirection(upperDirection)) {
      return upperDirection;
    }
    return this.DEFAULT_DIRECTION;
  }

  private isValidDirection(direction: string): direction is 'ASC' | 'DESC' {
    return this.VALID_DIRECTIONS.includes(direction as 'ASC' | 'DESC');
  }
}
