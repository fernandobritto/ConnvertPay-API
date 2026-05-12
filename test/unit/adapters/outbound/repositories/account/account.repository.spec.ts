import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository, EntityManager } from 'typeorm'
import { AccountRepository } from 'src/adapters/outbound/repositories/account/account.repository'
import { AccountEntity } from 'src/domain/entities/account.entity'

const mockTypeOrmRepo: jest.Mocked<Partial<Repository<AccountEntity>>> = {
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn()
}

const buildAccount = (overrides: Partial<AccountEntity> = {}): AccountEntity => ({
  id: 'uuid-1234',
  name: 'John Doe',
  number: 12345.67,
  description: 'Test account',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides
})

describe('AccountRepository', () => {
  let repository: AccountRepository

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountRepository,
        {
          provide: getRepositoryToken(AccountEntity),
          useValue: mockTypeOrmRepo
        }
      ]
    }).compile()

    repository = module.get<AccountRepository>(AccountRepository)
  })

  // ──────────────────────────────────────────────────────────────────────────
  // createAccount
  // ──────────────────────────────────────────────────────────────────────────
  describe('createAccount', () => {
    it('should save and return a new account', async () => {
      const input: Partial<AccountEntity> = { name: 'John Doe', number: 100 }
      const saved = buildAccount(input)
        ; (mockTypeOrmRepo.save as jest.Mock).mockResolvedValue(saved)

      const result = await repository.createAccount(input)

      expect(mockTypeOrmRepo.save).toHaveBeenCalledWith(input)
      expect(result).toEqual(saved)
    })

    it('should use the provided EntityManager when given', async () => {
      const saved = buildAccount()
      const mockManagerRepo = { save: jest.fn().mockResolvedValue(saved) }
      const mockManager = {
        getRepository: jest.fn().mockReturnValue(mockManagerRepo)
      } as unknown as EntityManager

      const result = await repository.createAccount({ name: 'Jane' }, mockManager)

      expect(mockManager.getRepository).toHaveBeenCalledWith(AccountEntity)
      expect(mockManagerRepo.save).toHaveBeenCalled()
      expect(result).toEqual(saved)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // findAccountById
  // ──────────────────────────────────────────────────────────────────────────
  describe('findAccountById', () => {
    it('should return the account when found', async () => {
      const account = buildAccount()
        ; (mockTypeOrmRepo.findOne as jest.Mock).mockResolvedValue(account)

      const result = await repository.findAccountById('uuid-1234')

      expect(mockTypeOrmRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1234' }
      })
      expect(result).toEqual(account)
    })

    it('should return null when the account does not exist', async () => {
      ; (mockTypeOrmRepo.findOne as jest.Mock).mockResolvedValue(null)

      const result = await repository.findAccountById('nonexistent')

      expect(result).toBeNull()
    })

    it('should return null when TypeORM returns undefined', async () => {
      ; (mockTypeOrmRepo.findOne as jest.Mock).mockResolvedValue(undefined)

      const result = await repository.findAccountById('id')

      expect(result).toBeNull()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // findAllAccount
  // ──────────────────────────────────────────────────────────────────────────
  describe('findAllAccount', () => {
    it('should return all accounts', async () => {
      const accounts = [buildAccount(), buildAccount({ id: 'uuid-2' })]
        ; (mockTypeOrmRepo.find as jest.Mock).mockResolvedValue(accounts)

      const result = await repository.findAllAccount()

      expect(mockTypeOrmRepo.find).toHaveBeenCalled()
      expect(result).toEqual(accounts)
    })

    it('should return an empty array when no accounts exist', async () => {
      ; (mockTypeOrmRepo.find as jest.Mock).mockResolvedValue([])

      const result = await repository.findAllAccount()

      expect(result).toEqual([])
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // updateAccount
  // ──────────────────────────────────────────────────────────────────────────
  describe('updateAccount', () => {
    it('should update and return the account when it exists', async () => {
      const existing = buildAccount()
      const updated = buildAccount({ name: 'Updated Name' })
        ; (mockTypeOrmRepo.findOne as jest.Mock).mockResolvedValue(existing)
        ; (mockTypeOrmRepo.save as jest.Mock).mockResolvedValue(updated)

      const result = await repository.updateAccount('uuid-1234', {
        name: 'Updated Name'
      })

      expect(mockTypeOrmRepo.save).toHaveBeenCalled()
      expect(result).toEqual(updated)
    })

    it('should return null when the account does not exist', async () => {
      ; (mockTypeOrmRepo.findOne as jest.Mock).mockResolvedValue(null)

      const result = await repository.updateAccount('nonexistent', {
        name: 'X'
      })

      expect(result).toBeNull()
      expect(mockTypeOrmRepo.save).not.toHaveBeenCalled()
    })

    it('should use the provided EntityManager when given', async () => {
      const existing = buildAccount()
      const updatedEntity = buildAccount({ name: 'Manager Updated' })
      const mockManagerRepo = {
        findOne: jest.fn().mockResolvedValue(existing),
        save: jest.fn().mockResolvedValue(updatedEntity)
      }
      const mockManager = {
        getRepository: jest.fn().mockReturnValue(mockManagerRepo)
      } as unknown as EntityManager

      const result = await repository.updateAccount(
        'uuid-1234',
        { name: 'Manager Updated' },
        mockManager
      )

      expect(mockManager.getRepository).toHaveBeenCalledWith(AccountEntity)
      expect(result).toEqual(updatedEntity)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // deleteAccount
  // ──────────────────────────────────────────────────────────────────────────
  describe('deleteAccount', () => {
    it('should call delete with the correct id', async () => {
      ; (mockTypeOrmRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 })

      await repository.deleteAccount('uuid-1234')

      expect(mockTypeOrmRepo.delete).toHaveBeenCalledWith({ id: 'uuid-1234' })
    })

    it('should resolve with undefined (void) on success', async () => {
      ; (mockTypeOrmRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 })

      const result = await repository.deleteAccount('uuid-1234')

      expect(result).toBeUndefined()
    })

    it('should use the provided EntityManager when given', async () => {
      const mockManagerRepo = {
        delete: jest.fn().mockResolvedValue({ affected: 1 })
      }
      const mockManager = {
        getRepository: jest.fn().mockReturnValue(mockManagerRepo)
      } as unknown as EntityManager

      await repository.deleteAccount('uuid-1234', mockManager)

      expect(mockManager.getRepository).toHaveBeenCalledWith(AccountEntity)
      expect(mockManagerRepo.delete).toHaveBeenCalledWith({ id: 'uuid-1234' })
    })
  })
})
