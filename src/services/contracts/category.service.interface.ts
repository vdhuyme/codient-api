import { Category } from '@entities/category'
import { IPaginationResult, IQueryOptions } from '@repositories/contracts/base-repository.interface'
import { IBaseService } from '@services/contracts/base.service.interface'
import { DeepPartial } from 'typeorm'

export interface ICategoryService extends IBaseService<Category> {
  getPublishedCategories(options: IQueryOptions<Category>): Promise<IPaginationResult<Category>>
  getPublishedCategory(id: string | number, options?: IQueryOptions<Category>): Promise<Category>
  getTrees(): Promise<Category[]>
  store(parentId: string | number, data: DeepPartial<Category>): Promise<Category>
  updateCategory(
    id: string | number,
    parentId: string | number,
    data: DeepPartial<Category>
  ): Promise<Category>
  paginate(options: IQueryOptions<Category>): Promise<IPaginationResult<Category>>
}
