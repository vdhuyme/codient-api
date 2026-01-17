import { inject } from 'inversify';
import { TYPES } from '@constants/types';
import { Controller, Post, Body, OkHttpResponse } from '@inversifyjs/http-core';
import { LoginDto } from '@dtos/login.dto';
import AuthService from '@services/auth.service';

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
}
