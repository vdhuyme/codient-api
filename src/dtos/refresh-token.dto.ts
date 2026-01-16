import { IsString, IsNotEmpty } from 'class-validator'

export class RefreshTokenRequestDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string
}
