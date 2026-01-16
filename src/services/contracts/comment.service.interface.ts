import { Comment } from '@entities/comment'
import { ICommentResponse } from '@mappers/comment.mapper'
import { IPaginationResult, IQueryOptions } from '@repositories/contracts/base-repository.interface'
import { IBaseService } from '@services/contracts/base.service.interface'
import { DeepPartial } from 'typeorm'

export interface ICommentService extends IBaseService<Comment> {
  getCommentsByPost(
    id: string | number,
    options: IQueryOptions<Comment>
  ): Promise<IPaginationResult<ICommentResponse>>
  store(userId: string | number, data: DeepPartial<Comment>): Promise<Comment>
  paginate(options: IQueryOptions<Comment>): Promise<IPaginationResult<Comment>>
}
