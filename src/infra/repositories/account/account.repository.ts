import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { IAccountRepository } from 'src/domain/infra/repositories/account/account.interface'
import { AccountEntity as Account } from 'src/domain/infra/entities/account.entity'
import { EntityManager, Repository } from 'typeorm'

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>
  ) {}
  findAllAccounts: () => Promise<Account[]>

  createAccount(
    info: Partial<Account>,
    manager?: EntityManager
  ): Promise<Account> {
    const repository = this.getAccountRepository(manager)
    return repository.save(info)
  }

  findAccountById = async (id: string): Promise<Account | null> => {
    const account = await this.accountRepository.findOne({
      where: { id }
    })
    return account ?? null
  }

  findAllAccount = async (): Promise<Account[]> => {
    return this.accountRepository.find()
  }

  async updateAccount(
    id: string,
    info: Partial<Account>,
    manager?: EntityManager
  ): Promise<Account | null> {
    const repository = this.getAccountRepository(manager)
    return repository.findOne({ where: { id } }).then((existingInfo) => {
      if (!existingInfo) return null
      Object.assign(existingInfo, info)
      return repository.save(existingInfo)
    })
  }

  async deleteAccount(id: string, manager?: EntityManager): Promise<void> {
    const repository = this.getAccountRepository(manager)
    return repository.delete({ id }).then(() => {
      // No return value needed, just ensure the operation completes
    })
  }

  private getAccountRepository(manager?: EntityManager) {
    return manager?.getRepository(Account) ?? this.accountRepository
  }
}
