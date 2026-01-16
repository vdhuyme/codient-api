import { inject } from 'inversify';
import { EntityTarget, EntitySchema, ObjectType } from 'typeorm';

export type RepositoryToken<T> = symbol & { __entity?: T };

function isEntitySchema<T>(entity: EntityTarget<T>): entity is EntitySchema<T> {
  return entity instanceof EntitySchema;
}

export function getRepositoryToken<T>(
  entity: EntityTarget<T>,
): RepositoryToken<T> {
  if (typeof entity === 'function') {
    return Symbol.for(
      `Repository<${(entity as ObjectType<T>).name}>`,
    ) as RepositoryToken<T>;
  }

  if (typeof entity === 'string') {
    return Symbol.for(`Repository<${entity}>`) as RepositoryToken<T>;
  }

  if (isEntitySchema(entity)) {
    return Symbol.for(
      `Repository<${entity.options.name}>`,
    ) as RepositoryToken<T>;
  }

  return Symbol.for(`Repository<${entity.name}>`) as RepositoryToken<T>;
}

export function injectRepository<T>(entity: EntityTarget<T>) {
  return inject(getRepositoryToken(entity));
}
