import { Module } from '@nestjs/common'
import { UtilsProvider } from './utils.provider'
import { UTILS_PROVIDER } from 'src/domain/infra/providers/utils/utils.interface'

@Module({
  exports: [UTILS_PROVIDER],
  providers: [
    {
      provide: UTILS_PROVIDER,
      useClass: UtilsProvider
    }
  ]
})
export class UtilsProviderModule {}
