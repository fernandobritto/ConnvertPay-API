import { Module } from '@nestjs/common'
import { JwtProvider } from './jwt.provider'
import { JWT_PROVIDER } from 'src/domain/infra/providers/jwt/jwt.interface'

@Module({
  exports: [JWT_PROVIDER],
  providers: [
    {
      provide: JWT_PROVIDER,
      useClass: JwtProvider
    }
  ]
})
export class JwtModule {}
