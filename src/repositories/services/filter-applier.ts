import { Filtering, FilterRule } from '../../domain/filterable';
import {
  ARRAY_OPERATORS,
  NULL_OPERATORS,
  SQL_OPERATORS,
  SqlOperator,
  STRING_MATCH_OPERATORS,
} from '@constants/sql';
import BadRequestException from '@exceptions/bad-request.exception';
import { FilterStrategyFactory } from '@repositories/filters/filter-strategy.factory';
import { FilterValueSanitizer } from '@repositories/filters/value-sanitizer';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

interface FilterGroup {
  property: string;
  filters: Filtering[];
}

interface FilterCondition {
  sql: string;
  params: Record<string, unknown>;
}

export class FilterApplier<E extends ObjectLiteral> {
  private readonly filterStrategyFactory: FilterStrategyFactory<E>;
  private readonly valueSanitizer: FilterValueSanitizer<E>;
  private readonly MAX_VALUE_LENGTH = 255;
  private readonly DANGEROUS_SQL_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
    /(--|;|\/\*|\*\/|'|"|`)/g,
  ];

  public constructor(
    private readonly repository: Repository<E>,
    private readonly alias: string,
  ) {
    this.filterStrategyFactory = new FilterStrategyFactory(repository);
    this.valueSanitizer = new FilterValueSanitizer(repository);
  }

  public applyFilters(qb: SelectQueryBuilder<E>, filtering: Filtering[]): void {
    if (!this.hasFilters(filtering)) {
      return;
    }

    this.validateFilters(filtering);

    const groups = this.groupByProperty(filtering);
    groups.forEach((group) => {
      this.applyFilterGroup(qb, group);
    });
  }

  private hasFilters(filtering: Filtering[] | undefined): boolean {
    return Array.isArray(filtering) && filtering.length > 0;
  }

  private validateFilters(filtering: Filtering[]): void {
    const errors: string[] = [];

    filtering.forEach((filter, index) => {
      this.validateColumnExistence(filter.property, errors, index);
      this.validateValueLength(filter.value, errors, index);
      this.validateSqlInjection(filter, errors, index);
    });

    if (errors.length > 0) {
      throw new BadRequestException(
        `Filter validation failed: ${errors.join(', ')}`,
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
        `Filter ${index}: Property "${property}" is not a valid column`,
      );
    }
  }

  private validateValueLength(
    value: string,
    errors: string[],
    index: number,
  ): void {
    if (value && value.length > this.MAX_VALUE_LENGTH) {
      errors.push(
        `Filter ${index}: Value length exceeds maximum of ${this.MAX_VALUE_LENGTH}`,
      );
    }
  }

  private validateSqlInjection(
    filter: Filtering,
    errors: string[],
    index: number,
  ): void {
    const valueToCheck = filter.value ? filter.value : '';
    const propertyToCheck = filter.property ? filter.property : '';

    const combinedCheck = `${propertyToCheck} ${valueToCheck}`;

    this.DANGEROUS_SQL_PATTERNS.forEach((pattern) => {
      if (pattern.test(combinedCheck)) {
        errors.push(`Filter ${index}: Potential SQL injection detected`);
      }
    });
  }

  private isValidColumn(property: string): boolean {
    const hasDot = property.includes('.');
    const cleanProperty = hasDot ? property.split('.')[1] : property;

    const columnMeta =
      this.repository.metadata.findColumnWithPropertyName(cleanProperty);

    return columnMeta !== undefined;
  }

  private groupByProperty(filters: Filtering[]): FilterGroup[] {
    const groupsMap = new Map<string, Filtering[]>();

    filters.forEach((filter) => {
      const existingFilters = groupsMap.get(filter.property);
      if (existingFilters) {
        groupsMap.set(filter.property, [...existingFilters, filter]);
      } else {
        groupsMap.set(filter.property, [filter]);
      }
    });

    const groups: FilterGroup[] = [];
    groupsMap.forEach((filterList, property) => {
      groups.push({ property, filters: filterList });
    });

    return groups;
  }

  private applyFilterGroup(
    qb: SelectQueryBuilder<E>,
    group: FilterGroup,
  ): void {
    if (group.filters.length === 1) {
      this.applySingleFilter(qb, group.filters[0], group.property);
      return;
    }

    this.applyMultipleFiltersWithOr(qb, group);
  }

  private applySingleFilter(
    qb: SelectQueryBuilder<E>,
    filter: Filtering,
    property: string,
  ): void {
    const column = this.getColumnName(property);
    const operator = this.mapRuleToOperator(filter.rule);
    const paramName = this.generateParamName(property, 0);

    const strategy = this.filterStrategyFactory.getStrategy(operator);
    strategy.apply({
      qb,
      column,
      operator,
      filter,
      paramName,
    });
  }

  private applyMultipleFiltersWithOr(
    qb: SelectQueryBuilder<E>,
    group: FilterGroup,
  ): void {
    const conditions = this.buildOrConditions(group);
    if (conditions.length === 0) {
      return;
    }

    const sql = this.buildOrSql(conditions);
    const params = this.mergeParams(conditions);
    qb.andWhere(`(${sql})`, params);
  }

  private buildOrConditions(group: FilterGroup): FilterCondition[] {
    const conditions: FilterCondition[] = [];

    group.filters.forEach((filter, index) => {
      const column = this.getColumnName(group.property);
      const operator = this.mapRuleToOperator(filter.rule);
      const paramName = this.generateParamName(group.property, index);

      const condition = this.buildCondition(
        column,
        operator,
        filter,
        paramName,
      );

      if (condition) {
        conditions.push(condition);
      }
    });

    return conditions;
  }

  private buildCondition(
    column: string,
    operator: SqlOperator,
    filter: Filtering,
    paramName: string,
  ): FilterCondition | null {
    if (ARRAY_OPERATORS.has(operator)) {
      return this.buildArrayCondition(column, operator, filter, paramName);
    }

    if (NULL_OPERATORS.has(operator)) {
      return this.buildNullCondition(column, operator);
    }

    if (STRING_MATCH_OPERATORS.has(operator)) {
      return this.buildStringMatchCondition(
        column,
        operator,
        filter,
        paramName,
      );
    }

    return this.buildComparisonCondition(column, operator, filter, paramName);
  }

  private buildArrayCondition(
    column: string,
    operator: SqlOperator,
    filter: Filtering,
    paramName: string,
  ): FilterCondition | null {
    const rawValues = this.parseArrayValue(filter.value);
    if (rawValues.length === 0) {
      return null;
    }

    const sanitizedValues = this.valueSanitizer.sanitize(
      filter.property,
      rawValues,
    );
    if (sanitizedValues.length === 0) {
      return null;
    }

    return {
      sql: `${column} ${operator} (:...${paramName})`,
      params: { [paramName]: sanitizedValues },
    };
  }

  private buildNullCondition(
    column: string,
    operator: SqlOperator,
  ): FilterCondition {
    return {
      sql: `${column} ${operator}`,
      params: {},
    };
  }

  private buildStringMatchCondition(
    column: string,
    operator: SqlOperator,
    filter: Filtering,
    paramName: string,
  ): FilterCondition {
    const filterValue = filter.value ? filter.value : '';
    const safeValue = this.escapeLikeValue(filterValue);
    const wildcardValue = `%${safeValue}%`;

    return {
      sql: `${column} ${operator} :${paramName}`,
      params: { [paramName]: wildcardValue },
    };
  }

  private buildComparisonCondition(
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
    if (!value) {
      return [];
    }

    return value
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }

  private escapeLikeValue(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/%/g, '\\%')
      .replace(/_/g, '\\_');
  }

  private buildOrSql(conditions: FilterCondition[]): string {
    return conditions.map((c) => c.sql).join(' OR ');
  }

  private mergeParams(conditions: FilterCondition[]): Record<string, unknown> {
    const merged: Record<string, unknown> = {};

    conditions.forEach((condition) => {
      Object.assign(merged, condition.params);
    });

    return merged;
  }

  private getColumnName(property: string): string {
    if (property.includes('.')) {
      return property;
    }
    return `${this.alias}.${property}`;
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

    const operator = operatorMap[rule];
    if (operator) {
      return operator;
    }
    return SQL_OPERATORS.EQ;
  }

  private generateParamName(property: string, index: number): string {
    const sanitizedProperty = property.replace(/[^a-zA-Z0-9_]/g, '_');
    return `param_${sanitizedProperty}_${index}`;
  }
}
