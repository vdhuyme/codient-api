import { IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator'
import { BASE_STATUS } from '@constants/base.status'

export class UpdateCommentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  content: string

  @IsOptional()
  @IsEnum(BASE_STATUS)
  status?: (typeof BASE_STATUS)[keyof typeof BASE_STATUS]
}
