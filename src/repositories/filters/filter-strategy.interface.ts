import { Filtering } from '../../domain/filterable';
import { SqlOperator } from '@constants/sql';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

export interface FilterStrategyContext<E extends ObjectLiteral> {
  qb: SelectQueryBuilder<E>;
  column: string;
  operator: SqlOperator;
  filter: Filtering;
  paramName: string;
}

export interface FilterStrategy<E extends ObjectLiteral> {
  supports(operator: SqlOperator): boolean;
  apply(context: FilterStrategyContext<E>): void;
}

export type FilterStrategyDependencies<E extends ObjectLiteral> = {
  repository: Repository<E>;
};
