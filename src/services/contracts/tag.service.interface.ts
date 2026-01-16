import { Tag } from '@entities/tag'
import { IPaginationResult, IQueryOptions } from '@repositories/contracts/base-repository.interface'
import { IBaseService } from '@services/contracts/base.service.interface'

export interface ITagService extends IBaseService<Tag> {
  paginate(options: IQueryOptions<Tag>): Promise<IPaginationResult<Tag>>
}
