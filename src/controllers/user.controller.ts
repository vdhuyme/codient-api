import { TYPES } from '@constants/types'
import { IdParamDto } from '@dtos/id-param.dto'
import { QueryParamDto } from '@dtos/query-param.dto'
import { UpdateUserStatusDto } from '@dtos/update-user-status.dto'
import { IUserService } from '@services/contracts/user.service.interface'
import { inject } from 'inversify'
import { Controller, Get, Patch, Body, Params, Query, UseGuard } from '@inversifyjs/http-core'
import { OkHttpResponse } from '@inversifyjs/http-core'
import { JwtGuard } from '@guards/jwt.guard'
import { PermissionGuard } from '@guards/permission.guard'
import { IQueryOptions } from '@repositories/contracts/base-repository.interface'
import { User } from '@entities/user'

@Controller('/users')
export default class UserController {
  constructor(@inject(TYPES.UserService) private userService: IUserService) {}

  @Get('/')
  @UseGuard(JwtGuard, PermissionGuard)
  async index(@Query() query: QueryParamDto) {
    const result = await this.userService.paginateWithDTO(query as unknown as IQueryOptions<User>)
    return new OkHttpResponse(result)
  }

  @Patch('/:id')
  @UseGuard(JwtGuard, PermissionGuard)
  async update(@Params() params: IdParamDto, @Body() dto: UpdateUserStatusDto) {
    await this.userService.updateStatus(params.id, dto.status)
    return new OkHttpResponse('ok')
  }
}
