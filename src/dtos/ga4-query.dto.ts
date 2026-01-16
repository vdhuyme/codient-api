import { IsOptional, IsDateString } from 'class-validator'

export class GA4QueryDto {
  @IsOptional()
  @IsDateString()
  startAt?: string

  @IsOptional()
  @IsDateString()
  endAt?: string
}
