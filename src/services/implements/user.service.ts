import { TYPES } from '@constants/types'
import { User } from '@entities/user'
import BadRequestException from '@exceptions/bad-request.exception'
import { IUserResponse, UserResource } from '@mappers/user.mapper'
import { IPaginationResult, IQueryOptions } from '@repositories/contracts/base-repository.interface'
import { IUserRepository } from '@repositories/contracts/user.repository.interface'
import { IUserService } from '@services/contracts/user.service.interface'
import BaseService from '@services/implements/base.service'
import { inject, injectable } from 'inversify'
import { ILike } from 'typeorm'

@injectable()
export default class UserService extends BaseService<User> implements IUserService {
  constructor(@inject(TYPES.UserRepository) userRepository: IUserRepository) {
    super(userRepository)
  }

  async paginateWithDTO(options: IQueryOptions<User>): Promise<IPaginationResult<IUserResponse>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', orderBy = 'DESC' } = options

    const allowedSortFields: (keyof User)[] = ['id', 'name', 'createdAt', 'status']
    const sortField = allowedSortFields.includes(sortBy as keyof User) ? sortBy : 'createdAt'

    const findOptions: IQueryOptions<User> = {
      page,
      limit,
      sortBy: sortField as keyof User,
      orderBy,
      where: search ? { name: ILike(`%${search}%`) } : undefined
    }

    const { items, meta } = await super.paginate(findOptions)
    return {
      items: UserResource.collection(items),
      meta
    }
  }

  async updateStatus(id: number | string, status: string): Promise<User> {
    const user = await this.findOneOrFail({ where: { id: Number(id) } })
    if (user.superUser) {
      throw new BadRequestException('Can not update status of super user')
    }

    user.status = status
    return this.save(user)
  }
}
