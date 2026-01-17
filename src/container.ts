import { TYPES } from '@constants/types';
import { AuthController } from '@controllers/auth-controller';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { HttpErrorFilter } from '@filters/http-error-filter';
import { Container } from 'inversify';
import { ISlugify, Slugify } from '@utils/slugify';
import AuthService from '@services/auth.service';
import { getRepositoryToken } from '@decorators/inject-repository';
import { User } from '@entities/user';
import { DataSource } from 'typeorm';
import { Category } from '@entities/category';
import { Post } from '@entities/post';
import { Comment } from '@entities/comment';

import { dataSource } from './data-source';
import { Hash } from '@config/hash';
import { TransformInterceptor } from '@interceptors/transform-interceptor';
import { UserRepository } from '@repositories/user-repository';

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
container.bind(HttpErrorFilter).toSelf().inSingletonScope();
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

export { container };
