export const BASE_STATUS = {
  PENDING: 'pending',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  ACTIVATED: 'activated',
  BLOCKED: 'blocked',
  DRAFTED: 'drafted',
  OK: 'ok',
} as const;

export type BaseStatus = (typeof BASE_STATUS)[keyof typeof BASE_STATUS];
