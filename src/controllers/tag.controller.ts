import { TYPES } from '@constants/types'
import { auth } from '@decorators/authenticate'
import { validate } from '@decorators/validator'
import { CREATE_TAG_REQUEST } from '@requests/create.tag.request'
import { UPDATE_TAG_REQUEST } from '@requests/update.tag.request'
import { ITagService } from '@services/contracts/tag.service.interface'
import { CREATED } from '@constants/http.status.code'
import { jsonResponse } from '@utils/json.response'
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
import { matchedData } from 'express-validator'
import { QUERY_FILTER_REQUEST } from '@requests/query.filter.request'
import { ID_REQUEST } from '@requests/id.request'
import { permissions } from '@decorators/authorize'

@Controller('/tags')
export default class TagController {
  constructor(@inject(TYPES.TagService) private tagService: ITagService) {}

  @Post('/')
  @auth()
  @permissions('tag.create')
  @validate(CREATE_TAG_REQUEST)
  async store(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const data = matchedData(req)

    try {
      const tag = this.tagService.create(data)
      await this.tagService.save(tag)
      return jsonResponse(res, 'ok', CREATED)
    } catch (error) {
      next(error)
    }
  }

  @Get('/')
  @auth()
  @permissions('tag.read')
  @validate(QUERY_FILTER_REQUEST)
  async index(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const data = matchedData(req)

    try {
      const result = await this.tagService.paginate(data)
      return jsonResponse(res, result)
    } catch (error) {
      next(error)
    }
  }

  @Put('/:id')
  @auth()
  @permissions('tag.update')
  @validate([...UPDATE_TAG_REQUEST, ...ID_REQUEST])
  async update(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const { id, ...rest } = matchedData(req)

    try {
      await this.tagService.updateById(id, rest)
      return jsonResponse(res, 'ok')
    } catch (error) {
      next(error)
    }
  }

  @Delete('/:id')
  @auth()
  @permissions('tag.delete')
  @validate(ID_REQUEST)
  async destroy(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const data = matchedData(req)

    try {
      await this.tagService.deleteById(data.id)
      return jsonResponse(res, 'ok')
    } catch (error) {
      next(error)
    }
  }
}
