import { inject } from 'inversify';
import { TYPES } from '@constants';
import { Controller, Post, Body } from '@inversifyjs/http-core';
import { LoginDto } from '@dto';
import { AuthService } from '@services';

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
