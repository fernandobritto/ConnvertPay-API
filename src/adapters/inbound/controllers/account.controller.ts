import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Post,
  Get,
  NotFoundException
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiCreatedResponse,
  ApiOkResponse
} from '@nestjs/swagger'
import { AccountService } from 'src/domain/account/account.service'
import {
  AccountDto,
  AccountResponseDto,
  DeleteAccountResponseDto
} from 'src/ports/inbound/dtos/account.dto'

@ApiTags('Account Management')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new account',
    description:
      'Creates a new account record in the system with the provided details'
  })
  @ApiBody({
    type: AccountDto,
    description: 'Account data to create',
    required: true
  })
  @ApiCreatedResponse({
    description: 'Account created successfully',
    type: AccountResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['name should not be empty', 'number must be a number']
        },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
        error: { type: 'string', example: 'Internal Server Error' }
      }
    }
  })
  async createAccount(
    @Body() account: AccountDto
  ): Promise<AccountResponseDto> {
    return this.accountService.createAccount(account)
  }

  @Get()
  @ApiOperation({
    summary: 'Get all accounts',
    description: 'Retrieves a list of all account records in the system'
  })
  @ApiOkResponse({
    description: 'List of all accounts retrieved successfully',
    type: [AccountResponseDto],
    isArray: true
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
        error: { type: 'string', example: 'Internal Server Error' }
      }
    }
  })
  async findAllAccount(): Promise<AccountResponseDto[]> {
    return this.accountService.findAllAccounts()
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get account by ID',
    description: 'Retrieves a specific account record by its unique identifier'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier (UUID) of the account',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiOkResponse({
    description: 'Account retrieved successfully',
    type: AccountResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid UUID format' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Account not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Account not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
        error: { type: 'string', example: 'Internal Server Error' }
      }
    }
  })
  async findAccountById(@Param('id') id: string): Promise<AccountResponseDto> {
    const account = await this.accountService.findAccountById(id)
    if (!account) {
      throw new NotFoundException('Account not found')
    }
    return account
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update account by ID',
    description: 'Updates an existing account record with new data'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier (UUID) of the account to update',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({
    type: AccountDto,
    description: 'Updated account data',
    required: true
  })
  @ApiOkResponse({
    description: 'Account updated successfully',
    type: AccountResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data, validation error, or invalid UUID format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['name should not be empty', 'number must be a number']
        },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Account not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Account not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
        error: { type: 'string', example: 'Internal Server Error' }
      }
    }
  })
  async updateAccount(
    @Param('id') id: string,
    @Body() account: AccountDto
  ): Promise<AccountResponseDto> {
    const updatedAccount = await this.accountService.updateAccount(id, account)
    if (!updatedAccount) {
      throw new NotFoundException('Account not found')
    }
    return updatedAccount
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete account by ID',
    description: 'Permanently deletes an account record from the system'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier (UUID) of the account to delete',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Account deleted successfully (no content returned)'
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid UUID format' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Account not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Account not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
        error: { type: 'string', example: 'Internal Server Error' }
      }
    }
  })
  async deleteAccount(@Param('id') id: string): Promise<void> {
    return this.accountService.deleteAccount(id)
  }
}
