import { Inject, Injectable, Optional } from '@nestjs/common'
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY
} from 'src/ports/outbound/repositories/account/account.interface'
import { AccountDto } from 'src/ports/inbound/dtos/account.dto'
import { MetricsService } from 'src/domain/metrics/metrics.service'

@Injectable()
export class AccountService {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Optional()
    private readonly metricsService?: MetricsService
  ) {}

  async createAccount(account: AccountDto) {
    const startTime = Date.now()
    
    try {
      const result = await this.accountRepository.createAccount(account)
      
      // Record success metrics
      this.metricsService?.recordAccountCreation()
      this.metricsService?.recordDatabaseOperation('account_create', (Date.now() - startTime) / 1000)
      
      return result
    } catch (error) {
      // Record error metrics
      this.metricsService?.recordBusinessValidationError('account_creation_failed')
      throw error
    }
  }

  async findAccountById(id: string) {
    const startTime = Date.now()
    
    try {
      const result = await this.accountRepository.findAccountById(id)
      
      // Record metrics
      this.metricsService?.recordAccountQuery()
      this.metricsService?.recordDatabaseOperation('account_find_by_id', (Date.now() - startTime) / 1000)
      
      return result
    } catch (error) {
      this.metricsService?.recordBusinessValidationError('account_query_failed')
      throw error
    }
  }

  async findAllAccounts() {
    const startTime = Date.now()
    
    try {
      const result = await this.accountRepository.findAllAccounts()
      
      // Record metrics
      this.metricsService?.recordAccountQuery()
      this.metricsService?.recordDatabaseOperation('account_find_all', (Date.now() - startTime) / 1000)
      
      return result
    } catch (error) {
      this.metricsService?.recordBusinessValidationError('account_query_failed')
      throw error
    }
  }

  async updateAccount(id: string, account: AccountDto) {
    const startTime = Date.now()
    
    try {
      const result = await this.accountRepository.updateAccount(id, account)
      
      // Record metrics
      this.metricsService?.recordAccountUpdate()
      this.metricsService?.recordDatabaseOperation('account_update', (Date.now() - startTime) / 1000)
      
      return result
    } catch (error) {
      this.metricsService?.recordBusinessValidationError('account_update_failed')
      throw error
    }
  }

  async deleteAccount(id: string) {
    const startTime = Date.now()
    
    try {
      const result = await this.accountRepository.deleteAccount(id)
      
      // Record metrics
      this.metricsService?.recordAccountDeletion()
      this.metricsService?.recordDatabaseOperation('account_delete', (Date.now() - startTime) / 1000)
      
      return result
    } catch (error) {
      this.metricsService?.recordBusinessValidationError('account_deletion_failed')
      throw error
    }
  }
}
