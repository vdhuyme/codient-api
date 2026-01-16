import { IsString, IsOptional, IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class QueryParamDto {
  @IsOptional()
  @IsString()
  search?: string

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
  @IsString()
  sortBy?: string

  @IsOptional()
  @IsString()
  orderBy?: 'ASC' | 'DESC'
}
