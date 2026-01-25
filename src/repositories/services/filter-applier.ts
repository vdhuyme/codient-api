import {
  ARRAY_OPERATORS,
  NULL_OPERATORS,
  SQL_OPERATORS,
  SqlOperator,
  STRING_MATCH_OPERATORS,
} from '@constants';
import { FilterCondition, FilterGroup, ValidationError } from '@domain';
import { Filtering, FilterRule } from '@domain';
import { BadRequestException } from '@exceptions';
import { FilterStrategyFactory } from '@repositories/filters';
import {
  ColumnExistenceValidator,
  SqlInjectionValidator,
  ValueLengthValidator,
  ValueTypeValidator,
} from '@repositories/validators';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

export class FilterApplier<E extends ObjectLiteral> {
  private readonly strategyFactory: FilterStrategyFactory<E>;
  private readonly columnValidator: ColumnExistenceValidator<E>;
  private readonly lengthValidator: ValueLengthValidator;
  private readonly injectionValidator: SqlInjectionValidator;
  private readonly typeValidator: ValueTypeValidator<E>;

  public constructor(
    private readonly repository: Repository<E>,
    private readonly alias?: string,
  ) {
    this.strategyFactory = new FilterStrategyFactory();
    this.columnValidator = new ColumnExistenceValidator(this.repository);
    this.lengthValidator = new ValueLengthValidator();
    this.injectionValidator = new SqlInjectionValidator();
    this.typeValidator = new ValueTypeValidator(this.repository);
  }

  public applyFilters(qb: SelectQueryBuilder<E>, filtering: Filtering[]): void {
    const hasFilters = Array.isArray(filtering) && filtering.length > 0;
    const shouldSkip = !hasFilters;

    return shouldSkip ? undefined : this.processFilters(qb, filtering);
  }

  private processFilters(
    qb: SelectQueryBuilder<E>,
    filtering: Filtering[],
  ): void {
    this.validateFilters(filtering);
    const groups = this.groupByProperty(filtering);
    groups.forEach((group) => this.applyFilterGroup(qb, group));
  }

  private validateFilters(filtering: Filtering[]): void {
    const errors = filtering.flatMap((filter, index) =>
      this.collectFilterErrors(filter, index),
    );

    const hasErrors = errors.length > 0;
    const errorMessage = errors.map((e) => `Filter ${e.index}: ${e.message}`);

    return hasErrors ? this.throwValidationError(errorMessage) : undefined;
  }

  private collectFilterErrors(
    filter: Filtering,
    index: number,
  ): ValidationError[] {
    const validators = [
      () => this.columnValidator.validate(filter.property),
      () => this.lengthValidator.validate(filter.value),
      () => this.injectionValidator.validate(filter),
      () =>
        this.typeValidator.validate(filter.property, filter.value, filter.rule),
    ];

    return validators
      .map((validate) => validate())
      .filter((error): error is string => error !== null)
      .map((message) => ({ index, message }));
  }

  private throwValidationError(messages: string[]): never {
    throw new BadRequestException(
      `Filter validation failed: ${messages.join(', ')}`,
    );
  }

  private groupByProperty(filters: Filtering[]): FilterGroup[] {
    const grouped = filters.reduce<Map<string, Filtering[]>>((map, filter) => {
      const existing = map.get(filter.property) ?? [];
      return map.set(filter.property, [...existing, filter]);
    }, new Map());

    return Array.from(grouped, ([property, filters]) => ({
      property,
      filters,
    }));
  }

  private applyFilterGroup(
    qb: SelectQueryBuilder<E>,
    group: FilterGroup,
  ): void {
    const isSingleFilter = group.filters.length === 1;
    return isSingleFilter
      ? this.applySingleFilter(qb, group.filters[0], group.property)
      : this.applyMultipleFiltersWithOr(qb, group);
  }

  private applySingleFilter(
    qb: SelectQueryBuilder<E>,
    filter: Filtering,
    property: string,
  ): void {
    const column = this.getColumnName(property, qb);
    const operator = this.mapRuleToOperator(filter.rule);
    const paramName = this.generateParamName(property, 0);
    const strategy = this.strategyFactory.getStrategy(operator);

    strategy.apply({ qb, column, operator, filter, paramName });
  }

  private applyMultipleFiltersWithOr(
    qb: SelectQueryBuilder<E>,
    group: FilterGroup,
  ): void {
    const conditions = this.makeOrConditions(qb, group);
    const hasConditions = conditions.length > 0;

    return hasConditions ? this.applyOrConditions(qb, conditions) : undefined;
  }

  private applyOrConditions(
    qb: SelectQueryBuilder<E>,
    conditions: FilterCondition[],
  ): void {
    const sql = conditions.map((c) => c.sql).join(' OR ');
    const params = conditions.reduce<Record<string, unknown>>(
      (acc, c) => ({ ...acc, ...c.params }),
      {},
    );
    qb.andWhere(`(${sql})`, params);
  }

  private makeOrConditions(
    qb: SelectQueryBuilder<E>,
    group: FilterGroup,
  ): FilterCondition[] {
    return group.filters
      .map((filter, index) => {
        const column = this.getColumnName(group.property, qb);
        const operator = this.mapRuleToOperator(filter.rule);
        const paramName = this.generateParamName(group.property, index);
        return this.makeCondition(column, operator, filter, paramName);
      })
      .filter((condition): condition is FilterCondition => condition !== null);
  }

  private makeCondition(
    column: string,
    operator: SqlOperator,
    filter: Filtering,
    paramName: string,
  ): FilterCondition | null {
    const builders = new Map<boolean, () => FilterCondition | null>([
      [
        ARRAY_OPERATORS.has(operator),
        () => this.makeArrayCondition(column, operator, filter, paramName),
      ],
      [
        NULL_OPERATORS.has(operator),
        () => this.makeNullCondition(column, operator),
      ],
      [
        STRING_MATCH_OPERATORS.has(operator),
        () =>
          this.makeStringMatchCondition(column, operator, filter, paramName),
      ],
    ]);

    const builder = Array.from(builders).find(([condition]) => condition)?.[1];
    return builder
      ? builder()
      : this.makeComparisonCondition(column, operator, filter, paramName);
  }

  private makeArrayCondition(
    column: string,
    operator: SqlOperator,
    filter: Filtering,
    paramName: string,
  ): FilterCondition | null {
    const rawValues = this.parseArrayValue(filter.value);
    const hasValues = rawValues.length > 0;

    return hasValues
      ? {
          sql: `${column} ${operator} (:...${paramName})`,
          params: { [paramName]: rawValues },
        }
      : null;
  }

  private makeNullCondition(
    column: string,
    operator: SqlOperator,
  ): FilterCondition {
    return { sql: `${column} ${operator}`, params: {} };
  }

  private makeStringMatchCondition(
    column: string,
    operator: SqlOperator,
    filter: Filtering,
    paramName: string,
  ): FilterCondition {
    const value = filter.value || '';
    const escaped = this.escapeLikeValue(value);
    const wildcarded = `%${escaped}%`;

    return {
      sql: `${column} ${operator} :${paramName}`,
      params: { [paramName]: wildcarded },
    };
  }

  private makeComparisonCondition(
    column: string,
    operator: SqlOperator,
    filter: Filtering,
    paramName: string,
  ): FilterCondition {
    return {
      sql: `${column} ${operator} :${paramName}`,
      params: { [paramName]: filter.value },
    };
  }

  private parseArrayValue(value: string): string[] {
    return value
      ? value
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
      : [];
  }

  private escapeLikeValue(value: string): string {
    const replacements: Array<[RegExp, string]> = [
      [/\\/g, '\\\\'],
      [/%/g, '\\%'],
      [/_/g, '\\_'],
    ];

    return replacements.reduce(
      (result, [pattern, replacement]) => result.replace(pattern, replacement),
      value,
    );
  }

  private getColumnName(property: string, qb: SelectQueryBuilder<E>): string {
    const hasAlias = property.includes('.');
    return hasAlias ? property : `${this.alias ?? qb.alias}.${property}`;
  }

  private mapRuleToOperator(rule: FilterRule): SqlOperator {
    const operatorMap: Record<FilterRule, SqlOperator> = {
      [FilterRule.EQUALS]: SQL_OPERATORS.EQ,
      [FilterRule.NOT_EQUALS]: SQL_OPERATORS.NEQ,
      [FilterRule.GREATER_THAN]: SQL_OPERATORS.GT,
      [FilterRule.GREATER_THAN_OR_EQUALS]: SQL_OPERATORS.GTE,
      [FilterRule.LESS_THAN]: SQL_OPERATORS.LT,
      [FilterRule.LESS_THAN_OR_EQUALS]: SQL_OPERATORS.LTE,
      [FilterRule.LIKE]: SQL_OPERATORS.LIKE,
      [FilterRule.NOT_LIKE]: SQL_OPERATORS.NLIKE,
      [FilterRule.IN]: SQL_OPERATORS.IN,
      [FilterRule.NOT_IN]: SQL_OPERATORS.NIN,
      [FilterRule.IS_NULL]: SQL_OPERATORS.ISNULL,
      [FilterRule.IS_NOT_NULL]: SQL_OPERATORS.ISNOTNULL,
    };

    return operatorMap[rule];
  }

  private generateParamName(property: string, index: number): string {
    const sanitized = property.replace(/[^a-zA-Z0-9_]/g, '_');
    return `param_${sanitized}_${index}`;
  }
}
