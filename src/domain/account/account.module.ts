import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountController } from 'src/adapters/inbound/controllers/account.controller'
import { AccountService } from './account.service'
import { AccountRepositoryModule } from 'src/adapters/outbound/repositories/account/account-repository.module'
import { ApplicationMetricsModule } from 'src/domain/metrics/metrics.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([]), 
    AccountRepositoryModule,
    ApplicationMetricsModule
  ],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [AccountService]
})
export class AccountModule {}
