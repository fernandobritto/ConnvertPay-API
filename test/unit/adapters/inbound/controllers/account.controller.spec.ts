import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { AccountController } from 'src/adapters/inbound/controllers/account.controller'
import { AccountService } from 'src/domain/account/account.service'
import { AccountDto } from 'src/ports/inbound/dtos/account.dto'
import { AccountEntity } from 'src/domain/entities/account.entity'

const mockAccountService: jest.Mocked<
  Pick<
    AccountService,
    | 'createAccount'
    | 'findAllAccounts'
    | 'findAccountById'
    | 'updateAccount'
    | 'deleteAccount'
  >
> = {
  createAccount: jest.fn(),
  findAllAccounts: jest.fn(),
  findAccountById: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn()
}

const buildAccountDto = (overrides: Partial<AccountDto> = {}): AccountDto => ({
  name: 'John Doe',
  number: 12345.67,
  description: 'Test account',
  ...overrides
})

const buildAccountResponse = (
  overrides: Partial<AccountEntity> = {}
): AccountEntity => ({
  id: 'uuid-1234',
  name: 'John Doe',
  number: 12345.67,
  description: 'Test account',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides
})

describe('AccountController', () => {
  let controller: AccountController

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        { provide: AccountService, useValue: mockAccountService }
      ]
    }).compile()

    controller = module.get<AccountController>(AccountController)
  })

  // ──────────────────────────────────────────────────────────────────────────
  // POST /account  – createAccount
  // ──────────────────────────────────────────────────────────────────────────
  describe('createAccount', () => {
    it('should create an account and return the created entity', async () => {
      const dto = buildAccountDto()
      const response = buildAccountResponse()
      mockAccountService.createAccount.mockResolvedValue(response)

      const result = await controller.createAccount(dto)

      expect(result).toEqual(response)
      expect(mockAccountService.createAccount).toHaveBeenCalledWith(dto)
    })

    it('should propagate service errors', async () => {
      mockAccountService.createAccount.mockRejectedValue(
        new Error('Unexpected DB error')
      )

      await expect(
        controller.createAccount(buildAccountDto())
      ).rejects.toThrow('Unexpected DB error')
    })

    it('should call createAccount with the exact dto passed', async () => {
      const dto = buildAccountDto({ name: 'Jane Doe', number: 9999.99 })
      mockAccountService.createAccount.mockResolvedValue(
        buildAccountResponse({ name: 'Jane Doe', number: 9999.99 })
      )

      await controller.createAccount(dto)

      expect(mockAccountService.createAccount).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Jane Doe', number: 9999.99 })
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // GET /account  – findAllAccount
  // ──────────────────────────────────────────────────────────────────────────
  describe('findAllAccount', () => {
    it('should return an array of accounts', async () => {
      const accounts = [buildAccountResponse(), buildAccountResponse({ id: 'uuid-5678' })]
      mockAccountService.findAllAccounts.mockResolvedValue(accounts)

      const result = await controller.findAllAccount()

      expect(result).toEqual(accounts)
      expect(result).toHaveLength(2)
    })

    it('should return an empty array when no accounts exist', async () => {
      mockAccountService.findAllAccounts.mockResolvedValue([])

      const result = await controller.findAllAccount()

      expect(result).toEqual([])
    })

    it('should propagate service errors', async () => {
      mockAccountService.findAllAccounts.mockRejectedValue(
        new Error('DB error')
      )

      await expect(controller.findAllAccount()).rejects.toThrow('DB error')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // GET /account/:id  – findAccountById
  // ──────────────────────────────────────────────────────────────────────────
  describe('findAccountById', () => {
    it('should return the account when found', async () => {
      const account = buildAccountResponse()
      mockAccountService.findAccountById.mockResolvedValue(account)

      const result = await controller.findAccountById('uuid-1234')

      expect(result).toEqual(account)
      expect(mockAccountService.findAccountById).toHaveBeenCalledWith('uuid-1234')
    })

    it('should throw NotFoundException when account does not exist', async () => {
      mockAccountService.findAccountById.mockResolvedValue(null)

      await expect(
        controller.findAccountById('nonexistent-id')
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw NotFoundException with message "Account not found"', async () => {
      mockAccountService.findAccountById.mockResolvedValue(null)

      await expect(
        controller.findAccountById('nonexistent-id')
      ).rejects.toThrow('Account not found')
    })

    it('should propagate other service errors', async () => {
      mockAccountService.findAccountById.mockRejectedValue(
        new Error('DB error')
      )

      await expect(controller.findAccountById('id')).rejects.toThrow('DB error')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // PUT /account/:id  – updateAccount
  // ──────────────────────────────────────────────────────────────────────────
  describe('updateAccount', () => {
    it('should update and return the updated account', async () => {
      const dto = buildAccountDto({ name: 'Updated Name' })
      const updated = buildAccountResponse({ name: 'Updated Name' })
      mockAccountService.updateAccount.mockResolvedValue(updated)

      const result = await controller.updateAccount('uuid-1234', dto)

      expect(result).toEqual(updated)
      expect(mockAccountService.updateAccount).toHaveBeenCalledWith(
        'uuid-1234',
        dto
      )
    })

    it('should throw NotFoundException when account to update does not exist', async () => {
      mockAccountService.updateAccount.mockResolvedValue(null)

      await expect(
        controller.updateAccount('nonexistent-id', buildAccountDto())
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw NotFoundException with message "Account not found"', async () => {
      mockAccountService.updateAccount.mockResolvedValue(null)

      await expect(
        controller.updateAccount('id', buildAccountDto())
      ).rejects.toThrow('Account not found')
    })

    it('should propagate other service errors', async () => {
      mockAccountService.updateAccount.mockRejectedValue(
        new Error('Update error')
      )

      await expect(
        controller.updateAccount('id', buildAccountDto())
      ).rejects.toThrow('Update error')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // DELETE /account/:id  – deleteAccount
  // ──────────────────────────────────────────────────────────────────────────
  describe('deleteAccount', () => {
    it('should call deleteAccount on the service with the correct id', async () => {
      mockAccountService.deleteAccount.mockResolvedValue(undefined)

      await controller.deleteAccount('uuid-1234')

      expect(mockAccountService.deleteAccount).toHaveBeenCalledWith('uuid-1234')
    })

    it('should propagate service errors', async () => {
      mockAccountService.deleteAccount.mockRejectedValue(
        new Error('Delete failed')
      )

      await expect(controller.deleteAccount('id')).rejects.toThrow(
        'Delete failed'
      )
    })
  })
})
