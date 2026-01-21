import 'reflect-metadata';

export const PERMISSIONS_KEY = Symbol('permissions');
export const PERMISSIONS_MATCH_MODE_KEY = Symbol('permissions_match_mode');

export type MatchMode = 'any' | 'all';

export function Permissions(
  permission: string | string[],
  matchMode: MatchMode = 'any',
): MethodDecorator {
  const required = Array.isArray(permission) ? permission : [permission];

  return (target, propertyKey) => {
    Reflect.defineMetadata(PERMISSIONS_KEY, required, target, propertyKey);
    Reflect.defineMetadata(
      PERMISSIONS_MATCH_MODE_KEY,
      matchMode,
      target,
      propertyKey,
    );
  };
}
