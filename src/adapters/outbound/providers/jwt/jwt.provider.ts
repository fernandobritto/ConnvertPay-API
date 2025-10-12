/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IJWTProvider } from 'src/ports/outbound/providers/jwt/jwt.interface'
import * as jsonwebtoken from 'jsonwebtoken'

@Injectable()
export class JwtProvider implements IJWTProvider {
  constructor(private readonly config: ConfigService) {}

  generate(payload: Record<string, unknown>): string {
    const privateKey: string = this.config.get('JWT_PRIVATE_KEY')!
    const expiresIn: number = Number(this.config.get('JWT_EXPIRES_IN')) || 3600

    return jsonwebtoken.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: expiresIn
    })
  }

  verify<T>(token: string): T | null {
    const decodedJwt = jsonwebtoken.decode(token, {
      complete: true,
      json: true
    })
    const payload = decodedJwt?.payload ?? null
    return payload as T | null
  }

  decode<T>(token: string): T | null {
    const publicKey: string = this.config.get('JWT_PUBLIC_KEY')!
    const payload = jsonwebtoken.verify(token, publicKey, {
      algorithms: ['RS256']
    })

    return payload as T
  }
}
