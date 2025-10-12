import { BaseError } from './base-error'

export class IntegrationExternalServiceError extends BaseError {
  public status?: number

  public constructor(
    message: string,
    status?: number,
    parameters?: Record<string, unknown> | unknown
  ) {
    super(message, 'IntegrationExternalService', parameters)
    this.status = status
  }
}

export class IntegrationServiceUnauthorizedError extends BaseError {
  public constructor(message: string, parameters?: Record<string, unknown>) {
    super(message, 'IntegrationServiceUnauthorized', parameters)
  }
}

export class ProviderInternalValidationError extends BaseError {
  public status?: number

  public constructor(
    message: string,
    status?: number,
    parameters?: Record<string, unknown> | unknown
  ) {
    super(message, 'ProviderInternalValidation', parameters)
    this.status = status
  }
}
