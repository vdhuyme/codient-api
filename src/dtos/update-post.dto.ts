import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
  Min
} from 'class-validator'
import { BASE_STATUS } from '@constants/base.status'
import { Type } from 'class-transformer'

export class UpdatePostDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  title: string

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  excerpt: string

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  content: string

  @IsOptional()
  @IsString()
  thumbnail?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readTime?: number

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  categoryId: number

  @IsOptional()
  @IsEnum(BASE_STATUS)
  status?: (typeof BASE_STATUS)[keyof typeof BASE_STATUS]

  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  tagIds: number[]
}
