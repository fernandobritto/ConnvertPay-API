export class BaseError extends Error {
  public code: string

  public parameters?: Record<string, unknown> | unknown

  protected constructor(
    message: string,
    code: string,
    parameters?: Record<string, unknown> | unknown
  ) {
    super(message)
    this.code = code
    this.parameters = parameters
  }
}
