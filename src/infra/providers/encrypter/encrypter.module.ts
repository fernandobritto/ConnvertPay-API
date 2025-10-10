import { Module } from '@nestjs/common'
import { EncrypterProvider } from './encrypter.provider'
import { ENCRYPTER_PROVIDER } from 'src/domain/infra/providers/encrypter/encrypter.interface'

@Module({
  exports: [ENCRYPTER_PROVIDER],
  providers: [
    {
      provide: ENCRYPTER_PROVIDER,
      useClass: EncrypterProvider
    }
  ]
})
export class EncrypterModule {}
