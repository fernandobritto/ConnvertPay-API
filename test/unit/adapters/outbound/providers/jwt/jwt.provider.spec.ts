import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { JwtProvider } from 'src/adapters/outbound/providers/jwt/jwt.provider'
import * as jsonwebtoken from 'jsonwebtoken'

jest.mock('jsonwebtoken')

describe('JwtProvider', () => {
  let provider: JwtProvider
  let configService: jest.Mocked<Pick<ConfigService, 'get'>>

  beforeEach(async () => {
    jest.clearAllMocks()

    configService = { get: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtProvider,
        { provide: ConfigService, useValue: configService }
      ]
    }).compile()

    provider = module.get<JwtProvider>(JwtProvider)
  })

  // ──────────────────────────────────────────────────────────────────────────
  // generate
  // ──────────────────────────────────────────────────────────────────────────
  describe('generate', () => {
    it('should sign the payload with the private key using RS256', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'JWT_PRIVATE_KEY') return 'private-key'
        if (key === 'JWT_EXPIRES_IN') return '3600'
        return undefined
      })
        ; (jsonwebtoken.sign as jest.Mock).mockReturnValue('signed-token')

      const result = provider.generate({ userId: '123' })

      expect(jsonwebtoken.sign).toHaveBeenCalledWith(
        { userId: '123' },
        'private-key',
        { algorithm: 'RS256', expiresIn: 3600 }
      )
      expect(result).toBe('signed-token')
    })

    it('should default expiresIn to 3600 when config is not set', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'JWT_PRIVATE_KEY') return 'private-key'
        return undefined // JWT_EXPIRES_IN not configured
      })
        ; (jsonwebtoken.sign as jest.Mock).mockReturnValue('token')

      provider.generate({ sub: 'user' })

      expect(jsonwebtoken.sign).toHaveBeenCalledWith(
        expect.anything(),
        'private-key',
        expect.objectContaining({ expiresIn: 3600 })
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // verify (decode without signature validation)
  // ──────────────────────────────────────────────────────────────────────────
  describe('verify', () => {
    it('should return the decoded payload', () => {
      const payload = { sub: 'user-id', iat: 1700000000 }
        ; (jsonwebtoken.decode as jest.Mock).mockReturnValue({ payload })

      const result = provider.verify<typeof payload>('some-token')

      expect(jsonwebtoken.decode).toHaveBeenCalledWith('some-token', {
        complete: true,
        json: true
      })
      expect(result).toEqual(payload)
    })

    it('should return null when decode returns null', () => {
      ; (jsonwebtoken.decode as jest.Mock).mockReturnValue(null)

      const result = provider.verify('invalid-token')

      expect(result).toBeNull()
    })

    it('should return null when decoded result has no payload', () => {
      ; (jsonwebtoken.decode as jest.Mock).mockReturnValue({ header: {} })

      const result = provider.verify('token-without-payload')

      expect(result).toBeNull()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // decode (with signature verification)
  // ──────────────────────────────────────────────────────────────────────────
  describe('decode', () => {
    it('should verify with the public key and return the payload', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'JWT_PUBLIC_KEY') return 'public-key'
        return undefined
      })
      const payload = { sub: 'user-id' }
        ; (jsonwebtoken.verify as jest.Mock).mockReturnValue(payload)

      const result = provider.decode<typeof payload>('signed-token')

      expect(jsonwebtoken.verify).toHaveBeenCalledWith('signed-token', 'public-key', {
        algorithms: ['RS256']
      })
      expect(result).toEqual(payload)
    })

    it('should propagate jsonwebtoken errors (e.g. expired token)', () => {
      configService.get.mockReturnValue('public-key')
        ; (jsonwebtoken.verify as jest.Mock).mockImplementation(() => {
          throw new Error('jwt expired')
        })

      expect(() => provider.decode('expired-token')).toThrow('jwt expired')
    })
  })
})
