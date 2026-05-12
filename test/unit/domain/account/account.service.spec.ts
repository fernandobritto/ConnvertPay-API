import { Test, TestingModule } from '@nestjs/testing'
import { AccountService } from 'src/domain/account/account.service'
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY
} from 'src/ports/outbound/repositories/account/account.interface'
import { MetricsService } from 'src/domain/metrics/metrics.service'
import { AccountDto } from 'src/ports/inbound/dtos/account.dto'
import { AccountEntity } from 'src/domain/entities/account.entity'

const mockAccountRepository: jest.Mocked<IAccountRepository> = {
  createAccount: jest.fn(),
  findAccountById: jest.fn(),
  findAllAccounts: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn()
}

const mockMetricsService: jest.Mocked<Partial<MetricsService>> = {
  recordAccountCreation: jest.fn(),
  recordAccountQuery: jest.fn(),
  recordAccountUpdate: jest.fn(),
  recordAccountDeletion: jest.fn(),
  recordDatabaseOperation: jest.fn(),
  recordBusinessValidationError: jest.fn()
}

const buildAccountDto = (overrides: Partial<AccountDto> = {}): AccountDto => ({
  name: 'John Doe',
  number: 12345.67,
  description: 'Test account',
  ...overrides
})

const buildAccountEntity = (
  overrides: Partial<AccountEntity> = {}
): AccountEntity => ({
  id: 'test-uuid-1234',
  name: 'John Doe',
  number: 12345.67,
  description: 'Test account',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides
})

describe('AccountService', () => {
  let service: AccountService

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: ACCOUNT_REPOSITORY,
          useValue: mockAccountRepository
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService
        }
      ]
    }).compile()

    service = module.get<AccountService>(AccountService)
  })

  // ──────────────────────────────────────────────────────────────────────────
  // createAccount
  // ──────────────────────────────────────────────────────────────────────────
  describe('createAccount', () => {
    it('should create an account and return the result', async () => {
      const dto = buildAccountDto()
      const entity = buildAccountEntity()
      mockAccountRepository.createAccount.mockResolvedValue(entity)

      const result = await service.createAccount(dto)

      expect(result).toEqual(entity)
      expect(mockAccountRepository.createAccount).toHaveBeenCalledWith(dto)
    })

    it('should record account creation metrics on success', async () => {
      const dto = buildAccountDto()
      mockAccountRepository.createAccount.mockResolvedValue(buildAccountEntity())

      await service.createAccount(dto)

      expect(mockMetricsService.recordAccountCreation).toHaveBeenCalledTimes(1)
      expect(mockMetricsService.recordDatabaseOperation).toHaveBeenCalledWith(
        'account_create',
        expect.any(Number)
      )
    })

    it('should record error metrics and rethrow when repository throws', async () => {
      const dto = buildAccountDto()
      const error = new Error('DB connection failed')
      mockAccountRepository.createAccount.mockRejectedValue(error)

      await expect(service.createAccount(dto)).rejects.toThrow(
        'DB connection failed'
      )
      expect(
        mockMetricsService.recordBusinessValidationError
      ).toHaveBeenCalledWith('account_creation_failed')
    })

    it('should not call recordAccountCreation when repository throws', async () => {
      mockAccountRepository.createAccount.mockRejectedValue(new Error('fail'))

      await expect(service.createAccount(buildAccountDto())).rejects.toThrow()

      expect(mockMetricsService.recordAccountCreation).not.toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // findAccountById
  // ──────────────────────────────────────────────────────────────────────────
  describe('findAccountById', () => {
    it('should return the account when found', async () => {
      const entity = buildAccountEntity()
      mockAccountRepository.findAccountById.mockResolvedValue(entity)

      const result = await service.findAccountById('test-uuid-1234')

      expect(result).toEqual(entity)
      expect(mockAccountRepository.findAccountById).toHaveBeenCalledWith(
        'test-uuid-1234'
      )
    })

    it('should return null when account does not exist', async () => {
      mockAccountRepository.findAccountById.mockResolvedValue(null)

      const result = await service.findAccountById('nonexistent-id')

      expect(result).toBeNull()
    })

    it('should record query metrics on success', async () => {
      mockAccountRepository.findAccountById.mockResolvedValue(buildAccountEntity())

      await service.findAccountById('test-uuid-1234')

      expect(mockMetricsService.recordAccountQuery).toHaveBeenCalledTimes(1)
      expect(mockMetricsService.recordDatabaseOperation).toHaveBeenCalledWith(
        'account_find_by_id',
        expect.any(Number)
      )
    })

    it('should record error metrics and rethrow when repository throws', async () => {
      const error = new Error('Query failed')
      mockAccountRepository.findAccountById.mockRejectedValue(error)

      await expect(service.findAccountById('id')).rejects.toThrow('Query failed')
      expect(
        mockMetricsService.recordBusinessValidationError
      ).toHaveBeenCalledWith('account_query_failed')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // findAllAccounts
  // ──────────────────────────────────────────────────────────────────────────
  describe('findAllAccounts', () => {
    it('should return all accounts', async () => {
      const entities = [buildAccountEntity(), buildAccountEntity({ id: 'id-2' })]
      mockAccountRepository.findAllAccounts.mockResolvedValue(entities)

      const result = await service.findAllAccounts()

      expect(result).toEqual(entities)
      expect(result).toHaveLength(2)
    })

    it('should return an empty array when no accounts exist', async () => {
      mockAccountRepository.findAllAccounts.mockResolvedValue([])

      const result = await service.findAllAccounts()

      expect(result).toEqual([])
    })

    it('should record query metrics on success', async () => {
      mockAccountRepository.findAllAccounts.mockResolvedValue([])

      await service.findAllAccounts()

      expect(mockMetricsService.recordAccountQuery).toHaveBeenCalledTimes(1)
      expect(mockMetricsService.recordDatabaseOperation).toHaveBeenCalledWith(
        'account_find_all',
        expect.any(Number)
      )
    })

    it('should record error metrics and rethrow when repository throws', async () => {
      const error = new Error('Find all failed')
      mockAccountRepository.findAllAccounts.mockRejectedValue(error)

      await expect(service.findAllAccounts()).rejects.toThrow('Find all failed')
      expect(
        mockMetricsService.recordBusinessValidationError
      ).toHaveBeenCalledWith('account_query_failed')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // updateAccount
  // ──────────────────────────────────────────────────────────────────────────
  describe('updateAccount', () => {
    it('should update an account and return the result', async () => {
      const dto = buildAccountDto({ name: 'Jane Doe' })
      const updated = buildAccountEntity({ name: 'Jane Doe' })
      mockAccountRepository.updateAccount.mockResolvedValue(updated)

      const result = await service.updateAccount('test-uuid-1234', dto)

      expect(result).toEqual(updated)
      expect(mockAccountRepository.updateAccount).toHaveBeenCalledWith(
        'test-uuid-1234',
        dto
      )
    })

    it('should return null when account to update does not exist', async () => {
      mockAccountRepository.updateAccount.mockResolvedValue(null)

      const result = await service.updateAccount('nonexistent', buildAccountDto())

      expect(result).toBeNull()
    })

    it('should record update metrics on success', async () => {
      mockAccountRepository.updateAccount.mockResolvedValue(buildAccountEntity())

      await service.updateAccount('id', buildAccountDto())

      expect(mockMetricsService.recordAccountUpdate).toHaveBeenCalledTimes(1)
      expect(mockMetricsService.recordDatabaseOperation).toHaveBeenCalledWith(
        'account_update',
        expect.any(Number)
      )
    })

    it('should record error metrics and rethrow when repository throws', async () => {
      const error = new Error('Update failed')
      mockAccountRepository.updateAccount.mockRejectedValue(error)

      await expect(
        service.updateAccount('id', buildAccountDto())
      ).rejects.toThrow('Update failed')
      expect(
        mockMetricsService.recordBusinessValidationError
      ).toHaveBeenCalledWith('account_update_failed')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // deleteAccount
  // ──────────────────────────────────────────────────────────────────────────
  describe('deleteAccount', () => {
    it('should delete an account successfully', async () => {
      mockAccountRepository.deleteAccount.mockResolvedValue(undefined)

      await service.deleteAccount('test-uuid-1234')

      expect(mockAccountRepository.deleteAccount).toHaveBeenCalledWith(
        'test-uuid-1234'
      )
    })

    it('should record deletion metrics on success', async () => {
      mockAccountRepository.deleteAccount.mockResolvedValue(undefined)

      await service.deleteAccount('test-uuid-1234')

      expect(mockMetricsService.recordAccountDeletion).toHaveBeenCalledTimes(1)
      expect(mockMetricsService.recordDatabaseOperation).toHaveBeenCalledWith(
        'account_delete',
        expect.any(Number)
      )
    })

    it('should record error metrics and rethrow when repository throws', async () => {
      const error = new Error('Delete failed')
      mockAccountRepository.deleteAccount.mockRejectedValue(error)

      await expect(service.deleteAccount('id')).rejects.toThrow('Delete failed')
      expect(
        mockMetricsService.recordBusinessValidationError
      ).toHaveBeenCalledWith('account_deletion_failed')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Metrics service is optional
  // ──────────────────────────────────────────────────────────────────────────
  describe('when metricsService is not provided', () => {
    let serviceWithoutMetrics: AccountService

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AccountService,
          {
            provide: ACCOUNT_REPOSITORY,
            useValue: mockAccountRepository
          }
        ]
      }).compile()

      serviceWithoutMetrics = module.get<AccountService>(AccountService)
    })

    it('should create an account without throwing when metricsService is absent', async () => {
      mockAccountRepository.createAccount.mockResolvedValue(buildAccountEntity())

      await expect(
        serviceWithoutMetrics.createAccount(buildAccountDto())
      ).resolves.not.toThrow()
    })

    it('should still rethrow repository errors without metricsService', async () => {
      mockAccountRepository.createAccount.mockRejectedValue(new Error('DB err'))

      await expect(
        serviceWithoutMetrics.createAccount(buildAccountDto())
      ).rejects.toThrow('DB err')
    })
  })
})
