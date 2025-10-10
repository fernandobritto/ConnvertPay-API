import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountController } from './account.controller'
import { AccountService } from './account.service'
import { AccountRepositoryModule } from 'src/infra/repositories/account/account-repository.module'

@Module({
  imports: [TypeOrmModule.forFeature([]), AccountRepositoryModule],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService]
})
export class AccountModule {}
