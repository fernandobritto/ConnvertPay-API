import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IEncrypterProvider } from 'src/domain/infra/providers/encrypter/encrypter.interface'
import * as bcrypt from 'bcrypt'
import crypto from 'crypto'

@Injectable()
export class EncrypterProvider implements IEncrypterProvider {
  constructor(private readonly config: ConfigService) {}

  encrypt(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }

  compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  encodeSHA256(data: string): string {
    try {
      const publicKey: string = this.config.get(
        'PASSWORD_ENCRYPTION_PUBLIC_KEY'
      )!
      const dataString = JSON.stringify(data)

      const hmac = crypto.createHmac('sha256', publicKey)
      const hmacWithData = hmac.update(dataString)

      const hash = hmacWithData.digest('hex')

      return hash
    } catch (error) {
      throw new Error(`Error encrypting object: ${error.message}`)
    }
  }

  decodeSHA256(password: string): string {
    const decryptedPassword = crypto.privateDecrypt(
      {
        key: this.config.get('PASSWORD_ENCRYPTION_PRIVATE_KEY')!,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      Buffer.from(password, 'base64')
    )

    return decryptedPassword.toString('utf-8')
  }
}
