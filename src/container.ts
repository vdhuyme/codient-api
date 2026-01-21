import { TYPES } from '@constants';
import { AuthController } from '@controllers';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { DomainErrorFilter } from '@filters';
import { Container } from 'inversify';
import { ISlugify, Slugify } from '@utils';
import { AuthService } from '@services';
import { getRepositoryToken } from '@decorators';
import { Category, Comment, Post, User } from '@entities';
import { DataSource } from 'typeorm';

import { dataSource } from './data-source';
import { Hash } from '@config/hash';
import { TransformInterceptor } from '@interceptors';
import { UserRepository } from '@repositories';
import { JwtGuard, PermissionGuard } from '@guards';

const container = new Container();
const entities = [User, Category, Post, Comment];

/**
 * @description Bindings for DataSource
 * @constant
 */
container.bind<DataSource>(TYPES.DataSource).toConstantValue(dataSource);

/**
 * @description Bindings for Filters
 */
container.bind(DomainErrorFilter).toSelf().inSingletonScope();
container.bind(InversifyValidationErrorFilter).toSelf().inSingletonScope();
container.bind(TransformInterceptor).toSelf().inRequestScope();

/**
 * @description Bindings for Slugify utility
 * @singleton
 */
container.bind<ISlugify>(TYPES.Slugify).to(Slugify).inSingletonScope();
container.bind<Hash>(TYPES.Hash).to(Hash).inSingletonScope();

/**
 * @description Bindings for Controllers
 */
container.bind(AuthController).toSelf().inSingletonScope();

/**
 * @description Bindings for Repositories
 */
container
  .bind<UserRepository>(TYPES.UserRepository)
  .to(UserRepository)
  .inSingletonScope();

/**
 * @description Bindings for Services
 */
container
  .bind<AuthService>(TYPES.AuthService)
  .to(AuthService)
  .inSingletonScope();

/**
 * @description Bindings for Repositories
 */
entities.forEach((entity) => {
  container
    .bind(getRepositoryToken(entity))
    .toDynamicValue((ctx) => {
      const datasource = ctx.get<DataSource>(TYPES.DataSource);
      return datasource.getRepository(entity);
    })
    .inRequestScope();
});

/**
 * @description Bindings for Guards
 */
container.bind(JwtGuard).toSelf().inRequestScope();
container.bind(PermissionGuard).toSelf().inRequestScope();

export { container };
