export interface IUtilsProvider {
  lowerCase(str?: string): string
  asyncForEach<T>(
    array: T[],
    callback: (item: T, index: number, array: T[]) => Promise<void>
  ): Promise<void>
  sleep(ms: number): Promise<void>
  clearSymbols(value: string): string
  onlyNumbers(str?: string): string
  onlyLetters(str: string): string
  onlyLettersAndNumbers(str: string): string
  onlyLettersAndSpaces(str: string): string
  onlyLettersAndSpacesAndNumbers(str: string): string
  getMinutesFromSeconds(seconds: number): number
  getHoursFromSeconds(seconds: number): number
  getDaysFromSeconds(seconds: number): number
  generateUUID(): string
  sliceString(args: { value: string; start?: number; end?: number }): string
  isNullOrUndefined(value: any): boolean
  numberHourToString(hour: number, minutes: number): string
  formatFromFloatToReal(value: number): string
  padStartWithZeros(value: string, length: number): string
  putHourOnDate(date?: string, time?: number): string | undefined
  goBackTwoDecimalPlaces(value: number): number
  getTokenFromHeader(header: { authorization: string }): string
  upperCaseFirstLetter(word: string): string
  encryptDocument(document: string): string
  centsToReal(num: number): number
  centsToBrazilianRealFormatted(value: number): string
  rand(len: number): string
  randNewPassword(len: number): string
}

export const UTILS_PROVIDER = Symbol('UTILS_PROVIDER')
