import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import {
  AccountDto,
  AccountResponseDto,
  DeleteAccountResponseDto
} from 'src/ports/inbound/dtos/account.dto'

/**
 * Converts a plain object to an AccountDto instance and runs class-validator.
 * Returns the list of validation errors.
 */
async function validateDto<T extends object>(
  cls: new () => T,
  plain: Record<string, unknown>
): Promise<string[]> {
  const instance = plainToInstance(cls, plain)
  const errors = await validate(instance as object)
  return errors.flatMap((e) => Object.values(e.constraints ?? {}))
}

describe('AccountDto', () => {
  // ──────────────────────────────────────────────────────────────────────────
  // Happy path
  // ──────────────────────────────────────────────────────────────────────────
  describe('valid input', () => {
    it('should pass validation with all required fields', async () => {
      const errors = await validateDto(AccountDto, {
        name: 'John Doe',
        number: 12345.67
      })
      expect(errors).toHaveLength(0)
    })

    it('should pass validation with optional description provided', async () => {
      const errors = await validateDto(AccountDto, {
        name: 'John Doe',
        number: 100,
        description: 'A valid description'
      })
      expect(errors).toHaveLength(0)
    })

    it('should accept number = 0 (minimum boundary)', async () => {
      const errors = await validateDto(AccountDto, {
        name: 'Min Test',
        number: 0
      })
      expect(errors).toHaveLength(0)
    })

    it('should accept number = 99999999.99 (maximum boundary)', async () => {
      const errors = await validateDto(AccountDto, {
        name: 'Max Test',
        number: 99999999.99
      })
      expect(errors).toHaveLength(0)
    })

    it('should accept description at maximum length (255 chars)', async () => {
      const errors = await validateDto(AccountDto, {
        name: 'Test',
        number: 1,
        description: 'a'.repeat(255)
      })
      expect(errors).toHaveLength(0)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // name validation
  // ──────────────────────────────────────────────────────────────────────────
  describe('name field', () => {
    it('should fail when name is empty', async () => {
      const errors = await validateDto(AccountDto, { name: '', number: 1 })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should fail when name is missing', async () => {
      const errors = await validateDto(AccountDto, { number: 1 })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should fail when name is not a string', async () => {
      const errors = await validateDto(AccountDto, { name: 123, number: 1 })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should fail when name exceeds 255 characters', async () => {
      const errors = await validateDto(AccountDto, {
        name: 'a'.repeat(256),
        number: 1
      })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should pass when name is exactly 255 characters', async () => {
      const errors = await validateDto(AccountDto, {
        name: 'a'.repeat(255),
        number: 1
      })
      expect(errors).toHaveLength(0)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // number field
  // ──────────────────────────────────────────────────────────────────────────
  describe('number field', () => {
    it('should fail when number is missing', async () => {
      const errors = await validateDto(AccountDto, { name: 'John' })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should fail when number is not a number type', async () => {
      const errors = await validateDto(AccountDto, {
        name: 'John',
        number: 'not-a-number'
      })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should fail when number is below the minimum (< 0)', async () => {
      const errors = await validateDto(AccountDto, { name: 'John', number: -1 })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should fail when number exceeds the maximum (> 99999999.99)', async () => {
      const errors = await validateDto(AccountDto, {
        name: 'John',
        number: 100000000
      })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should fail when number has more than 2 decimal places', async () => {
      const errors = await validateDto(AccountDto, {
        name: 'John',
        number: 1.123
      })
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // description field (optional)
  // ──────────────────────────────────────────────────────────────────────────
  describe('description field', () => {
    it('should pass without description (optional field)', async () => {
      const errors = await validateDto(AccountDto, {
        name: 'John',
        number: 1
      })
      expect(errors).toHaveLength(0)
    })

    it('should fail when description is not a string', async () => {
      const errors = await validateDto(AccountDto, {
        name: 'John',
        number: 1,
        description: 12345
      })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should fail when description exceeds 255 characters', async () => {
      const errors = await validateDto(AccountDto, {
        name: 'John',
        number: 1,
        description: 'a'.repeat(256)
      })
      expect(errors.length).toBeGreaterThan(0)
    })
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// AccountResponseDto
// ──────────────────────────────────────────────────────────────────────────────
describe('AccountResponseDto', () => {
  it('should be constructable from a plain object with all fields', () => {
    const plain = {
      id: 'uuid-1234',
      name: 'John Doe',
      number: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const instance = plainToInstance(AccountResponseDto, plain)
    expect(instance.id).toBe('uuid-1234')
    expect(instance.name).toBe('John Doe')
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// DeleteAccountResponseDto
// ──────────────────────────────────────────────────────────────────────────────
describe('DeleteAccountResponseDto', () => {
  it('should hold the message and id fields', () => {
    const dto = new DeleteAccountResponseDto()
    dto.message = 'Account deleted successfully'
    dto.id = 'uuid-1234'
    expect(dto.message).toBe('Account deleted successfully')
    expect(dto.id).toBe('uuid-1234')
  })
})
