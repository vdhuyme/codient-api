import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator'

export class ChangePasswordRequestDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  oldPassword: string

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  newPassword: string
}
