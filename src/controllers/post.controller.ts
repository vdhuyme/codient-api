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
import { IPostService } from '@services/contracts/post.service.interface'
import { TYPES } from '@constants/types'
import { validate } from '@decorators/validator'
import { QUERY_FILTER_REQUEST } from '@requests/query.filter.request'
import { matchedData } from 'express-validator'
import { ID_REQUEST } from '@requests/id.request'
import { auth } from '@decorators/authenticate'
import { CREATE_POST_REQUEST } from '@requests/create.post.request'
import { UPDATE_POST_REQUEST } from '@requests/update.post.request'
import { QUERY_FILTER_PUBLISHED_POST_REQUEST } from '@requests/query.filter.published.post.request'
import { permissions } from '@decorators/authorize'

@Controller('/posts')
export class PostController {
  constructor(@inject(TYPES.PostService) private postService: IPostService) {}

  @Get('/published-posts')
  @validate(QUERY_FILTER_PUBLISHED_POST_REQUEST)
  async getPublishedPosts(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const data = matchedData(req)

    try {
      const result = await this.postService.getPublishedPosts(data)
      return jsonResponse(res, result)
    } catch (error) {
      next(error)
    }
  }

  @Get('/published-post/:id')
  @validate(ID_REQUEST)
  async getPublishedPost(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const { id } = matchedData(req)

    try {
      const post = await this.postService.getPublishedPost(id!)
      return jsonResponse(res, post)
    } catch (error) {
      next(error)
    }
  }

  @Get('/related-posts/:id')
  @validate([...QUERY_FILTER_REQUEST, ...ID_REQUEST])
  async getRelatedPosts(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const { id, limit } = matchedData(req)

    try {
      const posts = await this.postService.getRelatedPosts(id, limit)
      return jsonResponse(res, posts)
    } catch (error) {
      next(error)
    }
  }

  @Get('/')
  @auth()
  @permissions('post.read')
  @validate(QUERY_FILTER_REQUEST)
  async index(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const data = matchedData(req)

    try {
      const result = await this.postService.paginate(data)
      return jsonResponse(res, result)
    } catch (error) {
      next(error)
    }
  }

  @Post('/')
  @auth()
  @permissions('post.create')
  @validate(CREATE_POST_REQUEST)
  async store(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const { categoryId, tagIds, ...rest } = matchedData(req)
    const { userId } = req.auth

    try {
      await this.postService.store(userId, categoryId, tagIds, rest)
      return jsonResponse(res, null, CREATED, 'success')
    } catch (error) {
      next(error)
    }
  }

  @Put('/:id')
  @auth()
  @permissions('post.update')
  @validate([...UPDATE_POST_REQUEST, ...ID_REQUEST])
  async update(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const { id, categoryId, tagIds, ...rest } = matchedData(req)

    try {
      await this.postService.updatePost(id, categoryId, tagIds, rest)
      return jsonResponse(res, null, OK, 'success')
    } catch (error) {
      next(error)
    }
  }

  @Delete('/:id')
  @auth()
  @permissions('post.delete')
  @validate(ID_REQUEST)
  async destroy(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const { id } = matchedData(req)

    try {
      await this.postService.deleteById(id)
      return jsonResponse(res, null, OK, 'success')
    } catch (error) {
      next(error)
    }
  }
}
