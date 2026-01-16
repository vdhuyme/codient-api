import { inject } from 'inversify'
import { TYPES } from '@constants/types'
import { IAuthService } from '@services/contracts/auth.service.interface'
import { RegisterRequestDto } from '@dtos/register.dto'
import {
  Controller,
  Post,
  Get,
  Patch,
  Put,
  Body,
  Query,
  UseGuard,
  Request,
  CreatedHttpResponse,
  OkHttpResponse
} from '@inversifyjs/http-core'
import { LoginRequestDto } from '@dtos/login.dto'
import { RefreshTokenRequestDto } from '@dtos/refresh-token.dto'
import { ChangePasswordRequestDto } from '@dtos/change-password.dto'
import { UpdateProfileRequestDto } from '@dtos/update-profile.dto'
import { JwtGuard } from '@guards/jwt.guard'
// import { AuthenticatedRequest } from '@app-types/authenticated-request'

@Controller('/auth')
export default class AuthController {
  constructor(@inject(TYPES.AuthService) private authService: IAuthService) {}

  @Post('/login')
  async login(@Body() dto: LoginRequestDto) {
    const result = await this.authService.login(dto.email, dto.password)
    return new OkHttpResponse(result)
  }

  @Post('/register')
  async register(@Body() dto: RegisterRequestDto) {
    const result = await this.authService.register(dto.name, dto.email, dto.password)
    return new CreatedHttpResponse(result)
  }

  // @Get('/me')
  // @UseGuard(JwtGuard)
  // async me(@Request() req: AuthenticatedRequest) {
  //   const { userId } = req.auth
  //   const user = await this.authService.getUserInfo(userId)
  //   return new OkHttpResponse(user)
  // }

  @Get('/redirect/google')
  redirect() {
    const url = this.authService.redirect()
    return new OkHttpResponse(url)
  }

  @Get('/callback/google')
  async callback(@Query() query: { code: string }) {
    return new OkHttpResponse(await this.authService.callback(query.code))
  }

  @Post('/refresh-token')
  refreshAccessToken(@Body() dto: RefreshTokenRequestDto) {
    return new OkHttpResponse(this.authService.refreshAccessToken(dto.refreshToken))
  }

  // @Patch('/change-password')
  // @UseGuard(JwtGuard)
  // async changePassword(
  //   @Body() dto: ChangePasswordRequestDto,
  //   @Request() req: AuthenticatedRequest
  // ) {
  //   const { userId } = req.auth
  //   return new OkHttpResponse(
  //     await this.authService.changePassword(userId, dto.oldPassword, dto.newPassword)
  //   )
  // }

  // @Put('/profile')
  // @UseGuard(JwtGuard)
  // async updateProfile(@Body() dto: UpdateProfileRequestDto, @Request() req: AuthenticatedRequest) {
  //   const { userId } = req.auth
  //   return await this.authService.updateProfile(userId, dto)
  // }

  @Get('/health-check')
  healthCheck() {
    const uptime = process.uptime()
    const timestamp = Date.now()
    return { uptime, timestamp }
  }
}
