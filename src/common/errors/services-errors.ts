import { BaseError } from './base-error'

export class ServiceNotFoundError extends BaseError {
  public constructor(message: string, parameters?: Record<string, string>) {
    super(message, 'NotFound', parameters)
  }
}

export class ServiceInvalidArgumentError extends BaseError {
  public constructor(message: string, parameters?: Record<string, string>) {
    super(message, 'InvalidArgument', parameters)
  }
}

export class ServiceInvalidRequestError extends BaseError {
  public constructor(message: string, parameters?: Record<string, string>) {
    super(message, 'InvalidRequest', parameters)
  }
}

export class ServiceAlreadyExistsError extends BaseError {
  public constructor(message: string, parameters?: Record<string, string>) {
    super(message, 'AlreadyExists', parameters)
  }
}

export class ServiceUnImplementedError extends BaseError {
  public constructor(message: string, parameters?: Record<string, string>) {
    super(message, 'UnImplemented', parameters)
  }
}

export class ServiceUnauthorizedError extends BaseError {
  public constructor(message: string, parameters?: Record<string, string>) {
    super(message, 'Unauthorized', parameters)
  }
}

export class ServiceInternalServerError extends BaseError {
  public constructor(message: string, parameters?: Record<string, string>) {
    super(message, 'InternalServer', parameters)
  }
}

export class ServiceTimeoutError extends BaseError {
  public status?: number

  public constructor(
    message: string,
    status?: number,
    parameters?: Record<string, unknown> | unknown
  ) {
    super(message, 'ServiceTimeoutError', parameters)
    this.status = status
  }
}
