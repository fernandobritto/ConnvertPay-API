import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Post,
  Get
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AccountService } from './account.service'
import { AccountDto } from 'src/domain/dtos/account.dto'

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiOperation({ summary: 'Create Account record' })
  @ApiResponse({
    status: 201,
    description: 'Account record created successfully'
  })
  async createAccount(@Body() account: AccountDto) {
    return this.accountService.createAccount(account)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Account record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Account record retrieved successfully'
  })
  async findAccountById(@Param('id') id: string) {
    return this.accountService.findAccountById(id)
  }

  @Get()
  @ApiOperation({ summary: 'Get all Account records' })
  @ApiResponse({
    status: 200,
    description: 'All Account records retrieved successfully'
  })
  async findAllAccount() {
    return this.accountService.findAllAccounts()
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Account record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Account record updated successfully'
  })
  async updateAccount(@Param('id') id: string, @Body() account: AccountDto) {
    return this.accountService.updateAccount(id, account)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Account record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Account record deleted successfully'
  })
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Param('id') id: string) {
    return this.accountService.deleteAccount(id)
  }
}
