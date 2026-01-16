import { IsNotEmpty, IsString, MaxLength, IsOptional, IsEnum } from 'class-validator'
import { BASE_STATUS } from '@constants/base.status'

export class CreateTagDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string

  @IsOptional()
  @IsEnum(BASE_STATUS)
  status?: (typeof BASE_STATUS)[keyof typeof BASE_STATUS]
}
