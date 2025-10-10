import { Injectable } from '@nestjs/common'
import { IUtilsProvider } from 'src/domain/infra/providers/utils/utils.interface'
import { v4 } from 'uuid'

@Injectable()
export class UtilsProvider implements IUtilsProvider {
  constructor() {}

  lowerCase(str: string = ''): string {
    return str.toLowerCase()
  }

  async asyncForEach<T>(
    array: T[],
    callback: (item: T, index: number, array: T[]) => Promise<void>
  ): Promise<void> {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  clearSymbols(value: string): string {
    return value?.replace(/[^\d]/gu, '') ?? ''
  }

  onlyNumbers(str: string = ''): string {
    return str?.replace(/[^0-9]/g, '') ?? ''
  }

  onlyLetters(str: string): string {
    return str.replace(/[^a-zA-Z]/g, '')
  }

  onlyLettersAndNumbers(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, '')
  }

  onlyLettersAndSpaces(str: string): string {
    return str.replace(/[^a-zA-Z ]/g, '')
  }

  onlyLettersAndSpacesAndNumbers(str: string): string {
    return str.replace(/[^a-zA-Z0-9 ]/g, '')
  }

  getMinutesFromSeconds(seconds: number): number {
    return Math.floor(seconds / 60)
  }

  getHoursFromSeconds(seconds: number): number {
    return Math.floor(seconds / 3600)
  }

  getDaysFromSeconds(seconds: number): number {
    return Math.floor(seconds / 86400)
  }

  generateUUID(): string {
    return v4()
  }

  sliceString(args: { value: string; start?: number; end?: number }): string {
    const { value, start = 0, end = value.length } = args
    return value.slice(start, end)
  }

  isNullOrUndefined(value: any): boolean {
    return value === null || value === undefined
  }

  numberHourToString(hour: number, minutes: number): string {
    return `${hour.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`
  }

  formatFromFloatToReal(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  public padStartWithZeros(value: string, length: number): string {
    return value.padStart(length, '0')
  }

  putHourOnDate(date?: string, time?: number): string | undefined {
    if (date) {
      const dateOnly = date.split('T')
      const timeOnly = time ? time.toString().padStart(2, '0') : '00'
      return `${dateOnly[0]}T${timeOnly}:00:00`
    }
    return undefined
  }

  goBackTwoDecimalPlaces(value: number): number {
    return Number((value / 100).toFixed(2))
  }

  getTokenFromHeader(header: { authorization: string }): string {
    const { authorization } = header

    if (authorization?.includes('Bearer')) {
      return authorization.split(' ')[1]
    }

    return authorization
  }

  upperCaseFirstLetter(word: string): string {
    return word[0].toUpperCase() + word.toLowerCase().substring(1)
  }

  private encryptCpf(cpf: string): string {
    const cpfWithoutSymbols = this.clearSymbols(cpf)

    return cpfWithoutSymbols.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/u,
      '***.$2.$3-***'
    )
  }

  private encryptCnpj(cnpj: string): string {
    const cnpjWithoutSymbols = this.clearSymbols(cnpj)

    return cnpjWithoutSymbols.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/u,
      '**.$2.$3/*******'
    )
  }

  encryptDocument(document: string): string {
    const documentWithoutSymbols = this.clearSymbols(document)

    if (documentWithoutSymbols.length < 12) {
      return this.encryptCpf(documentWithoutSymbols)
    } else {
      return this.encryptCnpj(documentWithoutSymbols)
    }
  }

  centsToReal(num: number): number {
    return num / 100
  }

  centsToBrazilianRealFormatted(value: number): string {
    return this.formatFromFloatToReal(this.centsToReal(value))
  }

  rand(len: number): string {
    let x: string = ''
    for (let i = 0; i < len; i++) {
      x += Math.floor(Math.random() * 10)
    }
    return x
  }

  randNewPassword(len: number): string {
    const upercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
    const numberChars = '0123456789'
    const specialChars = '!@#$%&*?'
    const allChars = `${upercaseChars}${lowercaseChars}${numberChars}${specialChars}`

    let x: string = ''
    for (let i = 0; i < len; i++) {
      x += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }
    return x
  }
}
