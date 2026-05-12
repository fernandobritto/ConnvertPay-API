import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { EncrypterProvider } from 'src/adapters/outbound/providers/encrypter/encrypter.provider'
import * as bcrypt from 'bcrypt'
import crypto from 'crypto'

jest.mock('bcrypt')
jest.mock('crypto', () => ({
  __esModule: true,
  default: {
    createHmac: jest.fn(),
    privateDecrypt: jest.fn(),
    constants: {
      RSA_PKCS1_OAEP_PADDING: 4
    }
  }
}))

describe('EncrypterProvider', () => {
  let provider: EncrypterProvider
  let configService: jest.Mocked<Pick<ConfigService, 'get'>>

  beforeEach(async () => {
    jest.clearAllMocks()

    configService = { get: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncrypterProvider,
        { provide: ConfigService, useValue: configService }
      ]
    }).compile()

    provider = module.get<EncrypterProvider>(EncrypterProvider)
  })

  // ──────────────────────────────────────────────────────────────────────────
  // encrypt
  // ──────────────────────────────────────────────────────────────────────────
  describe('encrypt', () => {
    it('should call bcrypt.hash with password and salt rounds 10', async () => {
      ; (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password')

      const result = await provider.encrypt('my-secret')

      expect(bcrypt.hash).toHaveBeenCalledWith('my-secret', 10)
      expect(result).toBe('hashed-password')
    })

    it('should propagate bcrypt errors', async () => {
      ; (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('bcrypt error'))

      await expect(provider.encrypt('secret')).rejects.toThrow('bcrypt error')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // compare
  // ──────────────────────────────────────────────────────────────────────────
  describe('compare', () => {
    it('should return true when password matches the hash', async () => {
      ; (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await provider.compare('password', 'hash')

      expect(result).toBe(true)
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hash')
    })

    it('should return false when password does not match', async () => {
      ; (bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const result = await provider.compare('wrong', 'hash')

      expect(result).toBe(false)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // encodeSHA256
  // ──────────────────────────────────────────────────────────────────────────
  describe('encodeSHA256', () => {
    it('should return the hex digest using the public key from config', () => {
      configService.get.mockReturnValue('test-public-key')
      const mockDigest = jest.fn().mockReturnValue('hex-hash')
      const mockUpdate = jest.fn().mockReturnValue({ digest: mockDigest })
      const mockHmac = { update: mockUpdate }
        ; (crypto.createHmac as jest.Mock).mockReturnValue(mockHmac)

      const result = provider.encodeSHA256('my-data')

      expect(crypto.createHmac).toHaveBeenCalledWith('sha256', 'test-public-key')
      expect(mockUpdate).toHaveBeenCalledWith(JSON.stringify('my-data'))
      expect(mockDigest).toHaveBeenCalledWith('hex')
      expect(result).toBe('hex-hash')
    })

    it('should throw a wrapped error when crypto fails', () => {
      configService.get.mockReturnValue('key')
        ; (crypto.createHmac as jest.Mock).mockImplementation(() => {
          throw new Error('crypto failure')
        })

      expect(() => provider.encodeSHA256('data')).toThrow(
        'Error encrypting object: crypto failure'
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // decodeSHA256
  // ──────────────────────────────────────────────────────────────────────────
  describe('decodeSHA256', () => {
    it('should decrypt using RSA OAEP with the private key from config', () => {
      configService.get.mockReturnValue('private-key-pem')
      const decryptedBuffer = Buffer.from('decrypted-data', 'utf-8')
        ; (crypto.privateDecrypt as jest.Mock).mockReturnValue(decryptedBuffer)

      const result = provider.decodeSHA256('base64encoded')

      expect(crypto.privateDecrypt).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'private-key-pem',
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        }),
        Buffer.from('base64encoded', 'base64')
      )
      expect(result).toBe('decrypted-data')
    })
  })
})
