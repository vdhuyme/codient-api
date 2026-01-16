import { Post } from '@entities/post'
import { IPaginationResult, IQueryOptions } from '@repositories/contracts/base-repository.interface'
import { IBaseService } from '@services/contracts/base.service.interface'
import { DeepPartial } from 'typeorm'

export interface IPostService extends IBaseService<Post> {
  getPublishedPosts(
    options: IQueryOptions<Post> & { categoryId?: number }
  ): Promise<IPaginationResult<Post>>
  getPublishedPost(id: string | number): Promise<Post>
  getRelatedPosts(id: string | number, limit: number): Promise<Post[]>
  store(
    userId: string | number,
    categoryId: string | number,
    tagIds: string[] | number[],
    data: DeepPartial<Post>
  ): Promise<Post>
  updatePost(
    id: string | number,
    categoryId: string | number,
    tagIds: string[] | number[],
    data: DeepPartial<Post>
  ): Promise<Post>
  paginate(options: IQueryOptions<Post>): Promise<IPaginationResult<Post>>
}
