import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsOptional,
  IsString,
  IsNumber,
  IsNotEmpty,
  MaxLength,
  Min,
  Max
} from 'class-validator'

export class AccountDto {
  @ApiProperty({
    description: 'The name of the account holder',
    example: 'John Doe',
    type: String,
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string

  @ApiProperty({
    description: 'The account number (numeric value with up to 2 decimal places)',
    example: 12345678.9,
    type: Number,
    minimum: 0,
    maximum: 99999999.99
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  number: number

  @ApiPropertyOptional({
    description: 'Optional description of the account',
    example: 'This is a sample account description',
    type: String,
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string
}

export class AccountResponseDto extends AccountDto {
  @ApiProperty({
    description: 'Unique identifier of the account',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    format: 'uuid'
  })
  id: string

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-12-15T10:30:00.000Z',
    type: String,
    format: 'date-time'
  })
  createdAt: Date

  @ApiProperty({
    description: 'Account last update timestamp',
    example: '2025-12-15T10:30:00.000Z',
    type: String,
    format: 'date-time'
  })
  updatedAt: Date
}

export class DeleteAccountResponseDto {
  @ApiProperty({
    description: 'Deletion confirmation message',
    example: 'Account deleted successfully'
  })
  message: string

  @ApiProperty({
    description: 'ID of the deleted account',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string
}
