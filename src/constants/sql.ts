import { ColumnType as TypeOrmColumnType } from 'typeorm';

export type ColumnType = TypeOrmColumnType | typeof Date;
export type SanitizedValue = string | number | Date;

export const SQL_OPERATORS = {
  EQ: '=',
  NEQ: '!=',
  GT: '>',
  GTE: '>=',
  LT: '<',
  LTE: '<=',
  LIKE: 'LIKE',
  NLIKE: 'NOT LIKE',
  IN: 'IN',
  NIN: 'NOT IN',
  ISNULL: 'IS NULL',
  ISNOTNULL: 'IS NOT NULL',
} as const;

export type SqlOperator = (typeof SQL_OPERATORS)[keyof typeof SQL_OPERATORS];

export const ARRAY_OPERATORS = new Set<SqlOperator>([
  SQL_OPERATORS.IN,
  SQL_OPERATORS.NIN,
]);

export const STRING_MATCH_OPERATORS = new Set<SqlOperator>([
  SQL_OPERATORS.LIKE,
  SQL_OPERATORS.NLIKE,
]);

export const NULL_OPERATORS = new Set<SqlOperator>([
  SQL_OPERATORS.ISNULL,
  SQL_OPERATORS.ISNOTNULL,
]);
