import { UtilsProvider } from 'src/adapters/outbound/providers/utils/utils.provider'

describe('UtilsProvider', () => {
  let provider: UtilsProvider

  beforeEach(() => {
    provider = new UtilsProvider()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // lowerCase
  // ──────────────────────────────────────────────────────────────────────────
  describe('lowerCase', () => {
    it('should convert string to lower case', () => {
      expect(provider.lowerCase('HELLO WORLD')).toBe('hello world')
    })

    it('should return empty string when no argument provided', () => {
      expect(provider.lowerCase()).toBe('')
    })

    it('should handle mixed case', () => {
      expect(provider.lowerCase('HeLLo')).toBe('hello')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // asyncForEach
  // ──────────────────────────────────────────────────────────────────────────
  describe('asyncForEach', () => {
    it('should invoke the callback for each element in order', async () => {
      const results: number[] = []
      await provider.asyncForEach([1, 2, 3], async (item) => {
        results.push(item)
      })
      expect(results).toEqual([1, 2, 3])
    })

    it('should await each callback sequentially', async () => {
      const order: string[] = []
      await provider.asyncForEach(['a', 'b'], async (item) => {
        await new Promise((r) => setTimeout(r, 1))
        order.push(item)
      })
      expect(order).toEqual(['a', 'b'])
    })

    it('should handle an empty array without error', async () => {
      const callback = jest.fn()
      await provider.asyncForEach([], callback)
      expect(callback).not.toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // sleep
  // ──────────────────────────────────────────────────────────────────────────
  describe('sleep', () => {
    it('should resolve after the given milliseconds', async () => {
      const start = Date.now()
      await provider.sleep(10)
      expect(Date.now() - start).toBeGreaterThanOrEqual(5)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // clearSymbols
  // ──────────────────────────────────────────────────────────────────────────
  describe('clearSymbols', () => {
    it('should remove all non-digit characters', () => {
      expect(provider.clearSymbols('(11) 91234-5678')).toBe('11912345678')
    })

    it('should return empty string for a non-digit-only string', () => {
      expect(provider.clearSymbols('abc')).toBe('')
    })

    it('should return empty string when no argument provided (undefined)', () => {
      expect(provider.clearSymbols(undefined as any)).toBe('')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // onlyNumbers
  // ──────────────────────────────────────────────────────────────────────────
  describe('onlyNumbers', () => {
    it('should remove all non-numeric characters', () => {
      expect(provider.onlyNumbers('abc123def456')).toBe('123456')
    })

    it('should return empty string for empty input', () => {
      expect(provider.onlyNumbers('')).toBe('')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // onlyLetters
  // ──────────────────────────────────────────────────────────────────────────
  describe('onlyLetters', () => {
    it('should remove all non-letter characters', () => {
      expect(provider.onlyLetters('abc123!@#')).toBe('abc')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // onlyLettersAndNumbers
  // ──────────────────────────────────────────────────────────────────────────
  describe('onlyLettersAndNumbers', () => {
    it('should remove special characters but keep letters and digits', () => {
      expect(provider.onlyLettersAndNumbers('hello world! 123')).toBe(
        'helloworld123'
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // onlyLettersAndSpaces
  // ──────────────────────────────────────────────────────────────────────────
  describe('onlyLettersAndSpaces', () => {
    it('should keep only letters and spaces', () => {
      expect(provider.onlyLettersAndSpaces('John 123 Doe!')).toBe('John  Doe')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // onlyLettersAndSpacesAndNumbers
  // ──────────────────────────────────────────────────────────────────────────
  describe('onlyLettersAndSpacesAndNumbers', () => {
    it('should keep letters, spaces, and numbers', () => {
      expect(provider.onlyLettersAndSpacesAndNumbers('Hello World 42!')).toBe(
        'Hello World 42'
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Time helpers
  // ──────────────────────────────────────────────────────────────────────────
  describe('getMinutesFromSeconds', () => {
    it('should return 2 for 150 seconds', () => {
      expect(provider.getMinutesFromSeconds(150)).toBe(2)
    })

    it('should return 0 for fewer than 60 seconds', () => {
      expect(provider.getMinutesFromSeconds(59)).toBe(0)
    })
  })

  describe('getHoursFromSeconds', () => {
    it('should return 1 for 3600 seconds', () => {
      expect(provider.getHoursFromSeconds(3600)).toBe(1)
    })

    it('should return 0 for fewer than 3600 seconds', () => {
      expect(provider.getHoursFromSeconds(3599)).toBe(0)
    })
  })

  describe('getDaysFromSeconds', () => {
    it('should return 1 for 86400 seconds', () => {
      expect(provider.getDaysFromSeconds(86400)).toBe(1)
    })

    it('should return 0 for fewer than 86400 seconds', () => {
      expect(provider.getDaysFromSeconds(86399)).toBe(0)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // generateUUID
  // ──────────────────────────────────────────────────────────────────────────
  describe('generateUUID', () => {
    it('should return a string matching the UUID v4 format', () => {
      const uuid = provider.generateUUID()
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      )
    })

    it('should return a unique UUID on each call', () => {
      expect(provider.generateUUID()).not.toBe(provider.generateUUID())
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // sliceString
  // ──────────────────────────────────────────────────────────────────────────
  describe('sliceString', () => {
    it('should slice from start to end', () => {
      expect(provider.sliceString({ value: 'Hello World', start: 0, end: 5 })).toBe('Hello')
    })

    it('should default to the full string when no start/end given', () => {
      expect(provider.sliceString({ value: 'test' })).toBe('test')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // isNullOrUndefined
  // ──────────────────────────────────────────────────────────────────────────
  describe('isNullOrUndefined', () => {
    it('should return true for null', () => {
      expect(provider.isNullOrUndefined(null)).toBe(true)
    })

    it('should return true for undefined', () => {
      expect(provider.isNullOrUndefined(undefined)).toBe(true)
    })

    it('should return false for 0', () => {
      expect(provider.isNullOrUndefined(0)).toBe(false)
    })

    it('should return false for an empty string', () => {
      expect(provider.isNullOrUndefined('')).toBe(false)
    })

    it('should return false for a valid object', () => {
      expect(provider.isNullOrUndefined({})).toBe(false)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // numberHourToString
  // ──────────────────────────────────────────────────────────────────────────
  describe('numberHourToString', () => {
    it('should pad hours and minutes with leading zeros', () => {
      expect(provider.numberHourToString(8, 5)).toBe('08:05')
    })

    it('should not pad when values are already two digits', () => {
      expect(provider.numberHourToString(23, 59)).toBe('23:59')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // formatFromFloatToReal
  // ──────────────────────────────────────────────────────────────────────────
  describe('formatFromFloatToReal', () => {
    it('should format a number as Brazilian Real currency', () => {
      const result = provider.formatFromFloatToReal(1234.56)
      // pt-BR locale formats as "R$ 1.234,56"
      expect(result).toContain('1')
      expect(result).toContain('234')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // padStartWithZeros
  // ──────────────────────────────────────────────────────────────────────────
  describe('padStartWithZeros', () => {
    it('should pad a short string with leading zeros', () => {
      expect(provider.padStartWithZeros('5', 3)).toBe('005')
    })

    it('should not pad when the string is already the target length', () => {
      expect(provider.padStartWithZeros('123', 3)).toBe('123')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // putHourOnDate
  // ──────────────────────────────────────────────────────────────────────────
  describe('putHourOnDate', () => {
    it('should append the time to the date string', () => {
      const result = provider.putHourOnDate('2024-06-15T00:00:00', 9)
      expect(result).toBe('2024-06-15T09:00:00')
    })

    it('should default to 00 when no time is provided', () => {
      const result = provider.putHourOnDate('2024-06-15T00:00:00')
      expect(result).toBe('2024-06-15T00:00:00')
    })

    it('should return undefined when no date is provided', () => {
      expect(provider.putHourOnDate()).toBeUndefined()
    })
  })
})
