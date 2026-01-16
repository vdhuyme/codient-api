import { SetMetadata } from '@nestjs/common';
import { MatchMode } from '@packages/auth/domain/types';

export const ROLES_KEY = 'roles';
export const ROLES_MATCH_MODE_KEY = 'roles_match_mode';

export const Roles = (roles: string[] | string, match: MatchMode = 'any') => {
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  return (
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<unknown>,
  ) => {
    SetMetadata(ROLES_KEY, requiredRoles)(target, key, descriptor);
    SetMetadata(ROLES_MATCH_MODE_KEY, match)(target, key, descriptor);
  };
};
