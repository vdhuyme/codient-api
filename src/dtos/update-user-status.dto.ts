import { IsNotEmpty, IsEnum } from 'class-validator'
import { BASE_STATUS } from '@constants/base.status'

export class UpdateUserStatusDto {
  @IsNotEmpty()
  @IsEnum(BASE_STATUS)
  status: (typeof BASE_STATUS)[keyof typeof BASE_STATUS]
}
