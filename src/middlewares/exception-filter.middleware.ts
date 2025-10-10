import { DateProvider } from '../infra/providers/date/date.provider'
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { APP_FILTER, HttpAdapterHost } from '@nestjs/core'
import type { Observable } from 'rxjs'

import { BaseError } from '../domain/errors/base-error'
import {
  IntegrationExternalServiceError,
  IntegrationServiceUnauthorizedError,
  ProviderInternalValidationError
} from '../domain/errors/integrations-errors'
import {
  ServiceAlreadyExistsError,
  ServiceInternalServerError,
  ServiceInvalidArgumentError,
  ServiceInvalidRequestError,
  ServiceNotFoundError,
  ServiceTimeoutError,
  ServiceUnImplementedError,
  ServiceUnauthorizedError
} from '../domain/errors/services-errors'

@Catch()
export class ExceptionHandler implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionHandler.name)

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly dateProvider: DateProvider
  ) {}

  private getExceptionStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus()
    } else if (exception instanceof ServiceNotFoundError) {
      return HttpStatus.NOT_FOUND
    } else if (exception instanceof ServiceInvalidArgumentError) {
      return HttpStatus.BAD_REQUEST
    } else if (exception instanceof ServiceInvalidRequestError) {
      return HttpStatus.BAD_REQUEST
    } else if (exception instanceof ServiceAlreadyExistsError) {
      return HttpStatus.CONFLICT
    } else if (exception instanceof ServiceUnImplementedError) {
      return HttpStatus.NOT_IMPLEMENTED
    } else if (exception instanceof ServiceUnauthorizedError) {
      return HttpStatus.UNAUTHORIZED
    } else if (exception instanceof ServiceInternalServerError) {
      return HttpStatus.INTERNAL_SERVER_ERROR
    } else if (exception instanceof IntegrationServiceUnauthorizedError) {
      return HttpStatus.UNAUTHORIZED
    } else if (exception instanceof IntegrationExternalServiceError) {
      return exception.status ?? HttpStatus.INTERNAL_SERVER_ERROR
    } else if (exception instanceof ProviderInternalValidationError) {
      return exception.status ?? HttpStatus.BAD_REQUEST
    } else if (exception instanceof ServiceTimeoutError) {
      return exception.status ?? HttpStatus.REQUEST_TIMEOUT
    }

    return HttpStatus.INTERNAL_SERVER_ERROR
  }

  private getExceptionParameters(
    exception: unknown
  ): Record<string, unknown> | undefined | unknown {
    if (exception instanceof BaseError) {
      return exception.parameters
    } else if (exception instanceof HttpException) {
      return { response: exception.getResponse() }
    }

    return undefined
  }

  catch(exception: unknown, host: ArgumentsHost): void | Observable<any> {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()

    const status = this.getExceptionStatus(exception)

    const parameters = this.getExceptionParameters(exception)

    const message = exception instanceof Error ? exception.message : 'Error'

    const response = {
      statusCode: status,
      message,
      parameters,
      timestamp: this.dateProvider.getCurrentDate().toISOString()
    }

    this.logger.log(response)

    if (host.getType() === 'http') {
      httpAdapter.reply(ctx.getResponse(), response, status)
    }
  }
}

export const exceptionHandlerProvider = {
  provide: APP_FILTER,
  useClass: ExceptionHandler
}
