import { IsNotEmpty, IsString, IsOptional, IsEnum, IsInt } from 'class-validator'
import { BASE_STATUS } from '@constants/base.status'
import { Type } from 'class-transformer'

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  thumbnail?: string

  @IsOptional()
  @IsString()
  icon?: string

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  parentId?: number

  @IsOptional()
  @IsEnum(BASE_STATUS)
  status?: (typeof BASE_STATUS)[keyof typeof BASE_STATUS]
}
