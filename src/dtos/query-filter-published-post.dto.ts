import { IsOptional, IsInt, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class QueryFilterPublishedPostDto {
  @IsOptional()
  @IsString()
  keyword?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  categoryId?: number
}
