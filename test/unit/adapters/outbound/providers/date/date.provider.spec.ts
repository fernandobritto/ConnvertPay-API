import { DateProvider } from 'src/adapters/outbound/providers/date/date.provider'

describe('DateProvider', () => {
  let provider: DateProvider

  beforeEach(() => {
    provider = new DateProvider()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getCurrentDate
  // ──────────────────────────────────────────────────────────────────────────
  describe('getCurrentDate', () => {
    it('should return a Date object', () => {
      expect(provider.getCurrentDate()).toBeInstanceOf(Date)
    })

    it('should return a date close to now (within 1 second)', () => {
      const now = Date.now()
      const result = provider.getCurrentDate().getTime()
      expect(Math.abs(result - now)).toBeLessThan(1000)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // formatDate
  // ──────────────────────────────────────────────────────────────────────────
  describe('formatDate', () => {
    it('should format a date with the given pattern', () => {
      const date = new Date('2024-06-15T12:00:00Z')
      // dd-MM-yyyy in pt-BR locale
      const result = provider.formatDate(date, 'dd-MM-yyyy')
      expect(result).toBe('15-06-2024')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // subMinutes / addMinutes
  // ──────────────────────────────────────────────────────────────────────────
  describe('subMinutes', () => {
    it('should subtract the given number of minutes', () => {
      const base = new Date('2024-01-01T12:00:00Z')
      const result = provider.subMinutes(base, 30)
      expect(result.toISOString()).toBe('2024-01-01T11:30:00.000Z')
    })
  })

  describe('addMinutes', () => {
    it('should add the given number of minutes', () => {
      const base = new Date('2024-01-01T12:00:00Z')
      const result = provider.addMinutes(base, 15)
      expect(result.toISOString()).toBe('2024-01-01T12:15:00.000Z')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // addDays / subMonths / addMonths
  // ──────────────────────────────────────────────────────────────────────────
  describe('addDays', () => {
    it('should add the given number of days', () => {
      const base = new Date('2024-01-01T12:00:00Z')
      const result = provider.addDays(base, 10)
      expect(result.getDate()).toBe(11)
    })
  })

  describe('subMonths', () => {
    it('should subtract the given number of months', () => {
      const base = new Date('2024-06-01T12:00:00Z')
      const result = provider.subMonths(base, 2)
      expect(result.getMonth()).toBe(3) // April (0-indexed)
    })
  })

  describe('addMonths', () => {
    it('should add the given number of months', () => {
      const base = new Date('2024-01-01T12:00:00Z')
      const result = provider.addMonths(base, 3)
      expect(result.getMonth()).toBe(3) // April
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // lastDayOfMonth
  // ──────────────────────────────────────────────────────────────────────────
  describe('lastDayOfMonth', () => {
    it('should return the last day of the month', () => {
      const date = new Date('2024-01-15')
      const result = provider.lastDayOfMonth(date)
      expect(result.getDate()).toBe(31)
    })

    it('should handle February in a leap year', () => {
      const date = new Date('2024-02-01T12:00:00Z') // 2024 is a leap year
      const result = provider.lastDayOfMonth(date)
      expect(result.getDate()).toBe(29)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getCurrentDatePlusMinutes / getCurrentDatePlusDays
  // ──────────────────────────────────────────────────────────────────────────
  describe('getCurrentDatePlusMinutes', () => {
    it('should return a date in the future when adding positive minutes', () => {
      const result = provider.getCurrentDatePlusMinutes(60)
      expect(result.getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('getCurrentDatePlusDays', () => {
    it('should return a date in the future when adding positive days', () => {
      const result = provider.getCurrentDatePlusDays(1)
      expect(result.getTime()).toBeGreaterThan(Date.now())
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getDateString
  // ──────────────────────────────────────────────────────────────────────────
  describe('getDateString', () => {
    it('should return the ISO date portion (yyyy-MM-dd)', () => {
      const date = new Date('2024-06-15T10:30:00Z')
      expect(provider.getDateString(date)).toBe('2024-06-15')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // isDateExpired
  // ──────────────────────────────────────────────────────────────────────────
  describe('isDateExpired', () => {
    it('should return true for a past date', () => {
      const pastDate = new Date('2020-01-01')
      expect(provider.isDateExpired(pastDate)).toBe(true)
    })

    it('should return false for a future date', () => {
      const futureDate = new Date('2099-01-01')
      expect(provider.isDateExpired(futureDate)).toBe(false)
    })

    it('should apply tolerance minutes when provided', () => {
      // A date 15 minutes in the past with tolerance 10: addMinutes(past-15, 10) = past-5 ≤ now → expired
      const past15 = provider.addMinutes(new Date(), -15)
      expect(provider.isDateExpired(past15, 10)).toBe(true)
    })

    it('should not expire when tolerance has not passed', () => {
      // Date 10 minutes in the future, tolerance is 5 → NOT expired
      const farFuture = provider.addMinutes(new Date(), 10)
      expect(provider.isDateExpired(farFuture, 5)).toBe(false)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // timestampToDate / dateToTimestamp
  // ──────────────────────────────────────────────────────────────────────────
  describe('timestampToDate', () => {
    it('should convert a unix timestamp (ms) to a Date', () => {
      const ts = 1700000000000
      const result = provider.timestampToDate(ts)
      expect(result).toBeInstanceOf(Date)
      expect(result.getTime()).toBe(ts)
    })
  })

  describe('dateToTimestamp', () => {
    it('should convert a Date to its unix timestamp', () => {
      const date = new Date('2024-01-01T00:00:00.000Z')
      expect(provider.dateToTimestamp(date)).toBe(date.getTime())
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getDate
  // ──────────────────────────────────────────────────────────────────────────
  describe('getDate', () => {
    it('should parse a valid yyyy-MM-dd string', () => {
      const result = provider.getDate('2024-06-15')
      expect(result).toBeInstanceOf(Date)
      expect(provider.getDateString(result)).toBe('2024-06-15')
    })

    it('should throw when no date string is provided', () => {
      expect(() => provider.getDate()).toThrow('A Date must be provided')
    })

    it('should throw for an invalid date string', () => {
      expect(() => provider.getDate('not-a-date')).toThrow('Invalid Date')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // isFuture
  // ──────────────────────────────────────────────────────────────────────────
  describe('isFuture', () => {
    it('should return true for a future date', () => {
      expect(provider.isFuture(new Date('2099-01-01'))).toBe(true)
    })

    it('should return false for a past date', () => {
      expect(provider.isFuture(new Date('2000-01-01'))).toBe(false)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // secondsToMilliseconds
  // ──────────────────────────────────────────────────────────────────────────
  describe('secondsToMilliseconds', () => {
    it('should convert seconds to milliseconds', () => {
      expect(provider.secondsToMilliseconds(5)).toBe(5000)
      expect(provider.secondsToMilliseconds(0)).toBe(0)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getCurrentPerformanceTime
  // ──────────────────────────────────────────────────────────────────────────
  describe('getCurrentPerformanceTime', () => {
    it('should return a positive number', () => {
      expect(provider.getCurrentPerformanceTime()).toBeGreaterThan(0)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // millisecondsToSecondsUnrounded
  // ──────────────────────────────────────────────────────────────────────────
  describe('millisecondsToSecondsUnrounded', () => {
    it('should convert 1500ms to 1.50 with 2 decimal places', () => {
      expect(provider.millisecondsToSecondsUnrounded(1500, 2)).toBe(1.5)
    })

    it('should handle 0 milliseconds', () => {
      expect(provider.millisecondsToSecondsUnrounded(0, 3)).toBe(0)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // differenceInMilliseconds
  // ──────────────────────────────────────────────────────────────────────────
  describe('differenceInMilliseconds', () => {
    it('should return positive value when endDate > startDate', () => {
      const start = new Date('2024-01-01T00:00:00Z')
      const end = new Date('2024-01-01T00:00:01Z')
      expect(provider.differenceInMilliseconds(end, start)).toBe(1000)
    })

    it('should return negative value when endDate < startDate', () => {
      const start = new Date('2024-01-01T00:00:01Z')
      const end = new Date('2024-01-01T00:00:00Z')
      expect(provider.differenceInMilliseconds(end, start)).toBe(-1000)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // isSameDay
  // ──────────────────────────────────────────────────────────────────────────
  describe('isSameDay', () => {
    it('should return true for two dates on the same calendar day', () => {
      const a = new Date('2024-06-15T12:00:00Z')
      const b = new Date('2024-06-15T18:00:00Z')
      expect(provider.isSameDay(a, b)).toBe(true)
    })

    it('should return false for dates on different days', () => {
      const a = new Date('2024-06-15')
      const b = new Date('2024-06-16')
      expect(provider.isSameDay(a, b)).toBe(false)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getCurrentDateString
  // ──────────────────────────────────────────────────────────────────────────
  describe('getCurrentDateString', () => {
    it('should return a string matching yyyy-MM-dd format', () => {
      const result = provider.getCurrentDateString()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getCurrentHoursWithMinutes
  // ──────────────────────────────────────────────────────────────────────────
  describe('getCurrentHoursWithMinutes', () => {
    it('should return a string matching HH:mm format', () => {
      const result = provider.getCurrentHoursWithMinutes()
      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getDateInBrFormat
  // ──────────────────────────────────────────────────────────────────────────
  describe('getDateInBrFormat', () => {
    it('should format a given date in dd-MM-yyyy using default delimiter', () => {
      const date = new Date('2024-06-15T12:00:00Z')
      expect(provider.getDateInBrFormat(date)).toBe('15-06-2024')
    })

    it('should use the provided delimiter', () => {
      const date = new Date('2024-06-15T12:00:00Z')
      expect(provider.getDateInBrFormat(date, '/')).toBe('15/06/2024')
    })

    it('should use the current date when no date argument is provided', () => {
      const result = provider.getDateInBrFormat()
      expect(result).toMatch(/^\d{2}-\d{2}-\d{4}$/)
    })
  })
})
