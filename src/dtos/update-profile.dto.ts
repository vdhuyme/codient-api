import { IsString, IsOptional, MaxLength } from 'class-validator'

export class UpdateProfileRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string

  @IsOptional()
  @IsString()
  avatar?: string
}
