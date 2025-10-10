export interface IDateProvider {
  formatDate(date: Date, formated: string): string
  getCurrentDate(): Date
  subMinutes(value: Date, minutes: number): Date
  addMinutes(value: Date, minutes: number): Date
  lastDayOfMonth(date: Date): Date
  addDays(value: Date, days: number): Date
  subMonths(value: Date, months: number): Date
  addMonths(value: Date, months: number): Date
  getCurrentDatePlusMinutes(minutes: number): Date
  getCurrentDatePlusDays(days: number): Date
  getDateString(value: Date): string
  isDateExpired(value: Date, timeToleranceMinutes?: number): boolean
  timestampToDate(timestamp: number): Date
  dateToTimestamp(date: Date): number
  getDate(date?: string): Date
  isFuture(date: Date | number): boolean
  secondsToMilliseconds(seconds: number): number
  getCurrentPerformanceTime(): number
  millisecondsToSecondsUnrounded(
    milliseconds: number,
    decimalPlaces: number
  ): number
  differenceInMilliseconds(
    endDate: Date | number,
    startDate: Date | number
  ): number
  isSameDay(dateLeft: Date | number, dateRight: Date | number): boolean
  getCurrentDateString(): string
  getCurrentHoursWithMinutes(): string
  getDateInBrFormat(date?: Date, delimiter?: string): string
}

export const DATE_PROVIDER = Symbol('DATE_PROVIDER')
