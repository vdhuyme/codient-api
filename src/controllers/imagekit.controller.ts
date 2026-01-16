import { TYPES } from '@constants/types'
import { auth } from '@decorators/authenticate'
import { permissions } from '@decorators/authorize'
import { IImagekitService } from '@services/contracts/imagekit.service.interface'
import { jsonResponse } from '@utils/json.response'
import { NextFunction, Request, Response } from 'express'
import { inject } from 'inversify'
import {
  Controller,
  Get,
  Next,
  Request as RequestDecorator,
  Response as ResponseDecorator
} from '@inversifyjs/http-core'

@Controller('/imagekit')
export default class ImagekitController {
  constructor(@inject(TYPES.ImagekitService) private imagekitService: IImagekitService) {}

  @Get('/auth')
  @auth()
  @permissions('file.upload')
  async auth(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    try {
      const result = this.imagekitService.auth()
      return jsonResponse(res, result)
    } catch (error) {
      next(error)
    }
  }
}
