import { CREATED, OK } from '@constants/http.status.code'
import { TYPES } from '@constants/types'
import { auth } from '@decorators/authenticate'
import { permissions } from '@decorators/authorize'
import { validate } from '@decorators/validator'
import { CREATE_COMMENT_REQUEST } from '@requests/create.comment.request'
import { ID_REQUEST } from '@requests/id.request'
import { QUERY_FILTER_REQUEST } from '@requests/query.filter.request'
import { UPDATE_COMMENT_REQUEST } from '@requests/update.comment.request'
import { ICommentService } from '@services/contracts/comment.service.interface'
import { jsonResponse } from '@utils/json.response'
import { NextFunction, Request, Response } from 'express'
import { matchedData } from 'express-validator'
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

@Controller('/comments')
export default class CommentController {
  constructor(@inject(TYPES.CommentService) private commentService: ICommentService) {}

  @Get('/by-post/:id')
  @validate([...QUERY_FILTER_REQUEST, ...ID_REQUEST])
  async getCommentsByPost(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const { id, ...rest } = matchedData(req)

    try {
      const result = await this.commentService.getCommentsByPost(id, rest)
      return jsonResponse(res, result)
    } catch (error) {
      next(error)
    }
  }

  @Post('/')
  @auth()
  @validate(CREATE_COMMENT_REQUEST)
  async store(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const data = matchedData(req)
    const { userId } = req.auth

    try {
      await this.commentService.store(userId, data)
      return jsonResponse(res, null, CREATED, 'success')
    } catch (error) {
      next(error)
    }
  }

  @Get('/')
  @auth()
  @permissions('comment.read')
  @validate(QUERY_FILTER_REQUEST)
  async index(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const data = matchedData(req)

    try {
      const result = await this.commentService.paginate(data)
      return jsonResponse(res, result)
    } catch (error) {
      next(error)
    }
  }

  @Put('/:id')
  @auth()
  @permissions('comment.update')
  @validate([...UPDATE_COMMENT_REQUEST, ...ID_REQUEST])
  async update(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const { id, ...rest } = matchedData(req)

    try {
      await this.commentService.updateById(id, rest)
      return jsonResponse(res, null, OK, 'success')
    } catch (error) {
      next(error)
    }
  }

  @Delete('/:id')
  @auth()
  @permissions('comment.delete')
  @validate(ID_REQUEST)
  async destroy(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const { id } = matchedData(req)

    try {
      await this.commentService.deleteById(id)
      return jsonResponse(res, null, OK, 'success')
    } catch (error) {
      next(error)
    }
  }
}
