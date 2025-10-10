export interface IJWTProvider {
  generate(payload: Record<string, unknown>): string
  verify<T>(token: string): T | null
  decode<T>(token: string): T | null
}

export const JWT_PROVIDER = Symbol('JWT_PROVIDER')
