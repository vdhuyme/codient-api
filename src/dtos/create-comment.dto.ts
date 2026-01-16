import { IsNotEmpty, IsInt, IsString, MinLength, MaxLength } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateCommentDto {
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  id: number

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  content: string
}
