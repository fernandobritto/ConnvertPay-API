import { AccountEntity } from '../../entities/account.entity'

export interface IAccountRepository {
  createAccount: (
    account: Partial<AccountEntity>,
    manager?: unknown
  ) => Promise<AccountEntity>
  findAccountById: (id: string) => Promise<AccountEntity | null>
  findAllAccounts: () => Promise<AccountEntity[]>
  updateAccount: (
    id: string,
    account: Partial<AccountEntity>,
    manager?: unknown
  ) => Promise<AccountEntity | null>
  deleteAccount: (id: string, manager?: unknown) => Promise<void>
}

export const ACCOUNT_REPOSITORY = Symbol('ACCOUNT_REPOSITORY')
