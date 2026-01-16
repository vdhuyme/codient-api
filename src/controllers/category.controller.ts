import { NextFunction, Request, Response } from 'express'
import { inject } from 'inversify'
import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Next,
  Request as RequestDecorator,
  Response as ResponseDecorator
} from '@inversifyjs/http-core'
import { CREATED, OK } from '@constants/http.status.code'
import { jsonResponse } from '@utils/json.response'
import { auth } from '@decorators/authenticate'
import { validate } from '@decorators/validator'
import { QUERY_FILTER_REQUEST } from '@requests/query.filter.request'
import { matchedData } from 'express-validator'
import { ICategoryService } from '@services/contracts/category.service.interface'
import { TYPES } from '@constants/types'
import { UPDATE_CATEGORY_REQUEST } from '@requests/update.category.request'
import { CREATE_CATEGORY_REQUEST } from '@requests/create.category.request'
import { ID_REQUEST } from '@requests/id.request'
import { permissions } from '@decorators/authorize'

@Controller('/categories')
export default class CategoryController {
  constructor(@inject(TYPES.CategoryService) private categoryService: ICategoryService) {}

  @Get('/published-categories')
  @validate(QUERY_FILTER_REQUEST)
  async getPublishedCategories(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const data = matchedData(req)

    try {
      const result = await this.categoryService.getPublishedCategories(data)
      return jsonResponse(res, result)
    } catch (error) {
      next(error)
    }
  }

  @Get('/published-categories/:id')
  @validate([...QUERY_FILTER_REQUEST, ...ID_REQUEST])
  async getPublishedCategory(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const { id, ...rest } = matchedData(req)

    try {
      const category = await this.categoryService.getPublishedCategory(id, rest)
      return jsonResponse(res, category)
    } catch (error) {
      next(error)
    }
  }

  @Get('/')
  @auth()
  @permissions('category.read')
  @validate(QUERY_FILTER_REQUEST)
  async index(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const data = matchedData(req)

    try {
      const result = await this.categoryService.paginate(data)
      return jsonResponse(res, result)
    } catch (error) {
      next(error)
    }
  }

  @Get('/trees')
  @auth()
  @permissions('category.read')
  async getTrees(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    try {
      const result = await this.categoryService.getTrees()
      return jsonResponse(res, result)
    } catch (error) {
      next(error)
    }
  }

  @Post('/')
  @auth()
  @permissions('category.create')
  @validate(CREATE_CATEGORY_REQUEST)
  async store(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const data = matchedData(req)
    const { parentId, ...rest } = data

    try {
      await this.categoryService.store(parentId, rest)
      return jsonResponse(res, null, CREATED, 'success')
    } catch (error) {
      next(error)
    }
  }

  @Put('/:id')
  @auth()
  @permissions('category.update')
  @validate([...UPDATE_CATEGORY_REQUEST, ...ID_REQUEST])
  async update(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const { id, parentId, ...rest } = matchedData(req)

    try {
      await this.categoryService.updateCategory(id, parentId, rest)
      return jsonResponse(res, null, OK, 'success')
    } catch (error) {
      next(error)
    }
  }

  @Delete('/:id')
  @auth()
  @permissions('category.delete')
  async destroy(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const id = req.params.id as string

    try {
      await this.categoryService.deleteById(id)
      return jsonResponse(res, null, OK, 'success')
    } catch (error) {
      next(error)
    }
  }
}
