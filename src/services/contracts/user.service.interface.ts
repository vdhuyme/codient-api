import { User } from '@entities/user'
import { IUserResponse } from '@mappers/user.mapper'
import { IPaginationResult, IQueryOptions } from '@repositories/contracts/base-repository.interface'
import { IBaseService } from '@services/contracts/base.service.interface'

export interface IUserService extends IBaseService<User> {
  paginateWithDTO(options: IQueryOptions<User>): Promise<IPaginationResult<IUserResponse>>
  updateStatus(id: number | string, status: string): Promise<User>
}
