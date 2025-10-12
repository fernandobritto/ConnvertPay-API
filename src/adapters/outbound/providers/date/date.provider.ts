import { Injectable } from '@nestjs/common'
import {
  addDays,
  addMinutes,
  addMonths,
  differenceInMilliseconds,
  format,
  isFuture,
  isSameDay,
  isValid,
  parse,
  secondsToMilliseconds,
  subMinutes,
  subMonths
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { IDateProvider } from 'src/ports/outbound/providers/date/date.interface'

@Injectable()
export class DateProvider implements IDateProvider {
  public formatDate(date: Date, formated: string): string {
    return format(date, formated, { locale: ptBR })
  }

  public getCurrentDate(): Date {
    return new Date()
  }

  public subMinutes(value: Date, minutes: number): Date {
    return subMinutes(value, minutes)
  }
  public addMinutes(value: Date, minutes: number): Date {
    return addMinutes(value, minutes)
  }

  public lastDayOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
  }

  public addDays(value: Date, days: number): Date {
    return addDays(value, days)
  }

  public subMonths(value: Date, months: number): Date {
    return subMonths(value, months)
  }

  public addMonths(value: Date, months: number): Date {
    return addMonths(value, months)
  }

  public getCurrentDatePlusMinutes(minutes: number): Date {
    return this.addMinutes(this.getCurrentDate(), minutes)
  }

  public getCurrentDatePlusDays(days: number): Date {
    return this.addDays(this.getCurrentDate(), days)
  }

  public getDateString(value: Date): string {
    return value.toISOString().substring(0, 10)
  }

  public isDateExpired(value: Date, timeToleranceMinutes?: number): boolean {
    if (timeToleranceMinutes) {
      return (
        this.addMinutes(value, timeToleranceMinutes) <= this.getCurrentDate()
      )
    }

    return value <= this.getCurrentDate()
  }

  public timestampToDate(timestamp: number): Date {
    return new Date(timestamp)
  }

  public dateToTimestamp(date: Date): number {
    return date.getTime()
  }

  public getDate(date?: string): Date {
    if (!date) {
      throw new Error('A Date must be provided')
    }

    const resultDate = parse(date, 'yyyy-MM-dd', new Date())

    if (!isValid(resultDate)) {
      console.info('Invalid date:', date)
      throw new Error('Invalid Date')
    }
    return resultDate
  }

  public isFuture(date: Date | number): boolean {
    return isFuture(date)
  }

  public secondsToMilliseconds(seconds: number): number {
    return secondsToMilliseconds(seconds)
  }

  public getCurrentPerformanceTime(): number {
    return performance.now()
  }

  public millisecondsToSecondsUnrounded(
    milliseconds: number,
    decimalPlaces: number
  ): number {
    return Number((milliseconds / 1000).toFixed(decimalPlaces))
  }

  public differenceInMilliseconds(
    endDate: Date | number,
    startDate: Date | number
  ): number {
    return differenceInMilliseconds(endDate, startDate)
  }

  public isSameDay(dateLeft: Date | number, dateRight: Date | number): boolean {
    return isSameDay(dateLeft, dateRight)
  }

  public getCurrentDateString(): string {
    return this.getDateString(this.getCurrentDate())
  }

  public getCurrentHoursWithMinutes(): string {
    return this.getCurrentDate().toISOString().substring(11, 16)
  }

  public getDateInBrFormat(date?: Date, delimiter?: string): string {
    return this.formatDate(
      date ?? this.getCurrentDate(),
      `dd${delimiter ?? '-'}MM${delimiter ?? '-'}yyyy`
    )
  }
}
