import { User } from '@entities/user'
import { IBaseRepository } from '@repositories/contracts/base-repository.interface'

export type IUserRepository = IBaseRepository<User>
