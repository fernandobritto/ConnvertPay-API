import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ACCOUNT_REPOSITORY } from 'src/ports/outbound/repositories/account/account.interface'
import { AccountEntity as Account } from 'src/domain/entities/account.entity'
import { AccountRepository } from './account.repository'

@Module({
  exports: [ACCOUNT_REPOSITORY],
  imports: [TypeOrmModule.forFeature([Account])],
  providers: [
    {
      provide: ACCOUNT_REPOSITORY,
      useClass: AccountRepository
    }
  ]
})
export class AccountRepositoryModule {}
