import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsNumber } from 'class-validator'

export class AccountDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    required: true,
    nullable: false
  })
  @IsString()
  name: string

  @ApiProperty({
    description: 'The number of the account',
    example: '12345678900',
    required: true,
    nullable: false
  })
  @IsNumber()
  number: number

  @ApiProperty({
    description: 'The description of the account',
    example: 'This is a description',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsString()
  description?: string
}
