import { Filtering } from '@domain';

export interface FilterGroup {
  property: string;
  filters: Filtering[];
}

export interface FilterCondition {
  sql: string;
  params: Record<string, unknown>;
}

export interface ValidationError {
  index: number;
  message: string;
}
