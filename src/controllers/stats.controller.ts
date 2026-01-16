import { TYPES } from '@constants/types'
import { auth } from '@decorators/authenticate'
import { permissions } from '@decorators/authorize'
import { validate } from '@decorators/validator'
import { GA4_REQUEST } from '@requests/ga4.request'
import { IStatsService } from '@services/contracts/stats.service.interface'
import { jsonResponse } from '@utils/json.response'
import { NextFunction, Request, Response } from 'express'
import { matchedData } from 'express-validator'
import { inject } from 'inversify'
import {
  Controller,
  Get,
  Next,
  Request as RequestDecorator,
  Response as ResponseDecorator
} from '@inversifyjs/http-core'

@Controller('/stats')
export default class StatsController {
  constructor(@inject(TYPES.StatsService) private statsService: IStatsService) {}

  @Get('/ga4')
  @auth()
  @permissions('stats.ga4')
  @validate(GA4_REQUEST)
  async ga4(
    @RequestDecorator() req: Request,
    @ResponseDecorator() res: Response,
    @Next() next: NextFunction
  ) {
    const { startAt, endAt } = matchedData(req)

    try {
      const result = await this.statsService.ga4(startAt, endAt)
      return jsonResponse(res, result)
    } catch (error) {
      next(error)
    }
  }
}
