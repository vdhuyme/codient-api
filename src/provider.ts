import { TYPES } from '@constants/types'
import { IUserRepository } from '@repositories/contracts/user.repository.interface'
import UserRepository from '@repositories/implements/user.repository'
import { IAuthService } from '@services/contracts/auth.service.interface'
import { IUserService } from '@services/contracts/user.service.interface'
import AuthService from '@services/implements/auth.service'
import UserService from '@services/implements/user.service'
import AuthController from '@controllers/auth.controller'
import UserController from '@controllers/user.controller'
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation'
import { HttpErrorFilter } from '@filters/http-error-filter'
import { Container } from 'inversify'
import { ISlugify, Slugify } from '@utils/slugify'

import { dataSource } from './data-source'

const container = new Container()

container.bind(TYPES.DataSource).toConstantValue(dataSource)
container.bind<ISlugify>(TYPES.Slugify).to(Slugify).inSingletonScope()

container.bind(AuthController).toSelf().inSingletonScope()
container.bind(UserController).toSelf().inSingletonScope()

container.bind(HttpErrorFilter).toSelf().inSingletonScope()
container.bind(InversifyValidationErrorFilter).toSelf().inSingletonScope()

container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope()

container.bind<IAuthService>(TYPES.AuthService).to(AuthService).inSingletonScope()
container.bind<IUserService>(TYPES.UserService).to(UserService).inSingletonScope()

export { container }
