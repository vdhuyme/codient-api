import { inject } from 'inversify';
import { TYPES } from '@constants';
import { Controller, Post, Body, UseGuard, Get } from '@inversifyjs/http-core';
import { LoginDto } from '@dto';
import { AuthService } from '@services';
import { JwtGuard, PermissionGuard } from '@guards';
import { Permissions } from '@decorators';

@Controller({ path: 'auth' })
export class AuthController {
  constructor(
    @inject(TYPES.AuthService)
    private authService: AuthService,
  ) {}

  @Post('/login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto.email, dto.password);
  }

  @Get()
  @UseGuard(JwtGuard, PermissionGuard)
  @Permissions('SOME_PERMISSION')
  async ok() {}
}
