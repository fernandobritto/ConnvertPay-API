export interface IEncrypterProvider {
  encrypt(password: string): Promise<string>
  compare(password: string, hash: string): Promise<boolean>
  encodeSHA256(data: string): string
  decodeSHA256(data: string): string
}

export const ENCRYPTER_PROVIDER = Symbol('ENCRYPTER_PROVIDER')
