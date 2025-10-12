import { Inject, Injectable } from '@nestjs/common'
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY
} from 'src/ports/outbound/repositories/account/account.interface'
import { AccountDto } from 'src/ports/inbound/dtos/account.dto'

@Injectable()
export class AccountService {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository
  ) {}

  async createAccount(account: AccountDto) {
    return this.accountRepository.createAccount(account)
  }

  async findAccountById(id: string) {
    return this.accountRepository.findAccountById(id)
  }

  async findAllAccounts() {
    return this.accountRepository.findAllAccounts()
  }

  async updateAccount(id: string, account: AccountDto) {
    return this.accountRepository.updateAccount(id, account)
  }

  async deleteAccount(id: string) {
    return this.accountRepository.deleteAccount(id)
  }
}
