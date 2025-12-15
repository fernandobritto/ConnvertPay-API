import { DateProvider } from 'src/adapters/outbound/providers/date/date.provider'
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Catch, HttpException, HttpStatus, Logger, Inject, Optional } from '@nestjs/common'
import { APP_FILTER, HttpAdapterHost } from '@nestjs/core'
import type { Observable } from 'rxjs'
import type { Request } from 'express'

import { BaseError } from 'src/common/errors/base-error'
import {
  IntegrationExternalServiceError,
  IntegrationServiceUnauthorizedError,
  ProviderInternalValidationError
} from 'src/common/errors/integrations-errors'
import {
  ServiceAlreadyExistsError,
  ServiceInternalServerError,
  ServiceInvalidArgumentError,
  ServiceInvalidRequestError,
  ServiceNotFoundError,
  ServiceTimeoutError,
  ServiceUnImplementedError,
  ServiceUnauthorizedError
} from 'src/common/errors/services-errors'
import { 
  IMetricsProvider, 
  METRICS_PROVIDER 
} from 'src/ports/outbound/providers/metrics/metrics.interface'

@Catch()
export class ExceptionHandler implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionHandler.name)

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly dateProvider: DateProvider,
    @Optional()
    @Inject(METRICS_PROVIDER)
    private readonly metricsProvider?: IMetricsProvider
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
    const request = ctx.getRequest<Request>()

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

    // Record exception metrics if provider is available
    if (this.metricsProvider && host.getType() === 'http') {
      try {
        const method = request.method || 'UNKNOWN'
        const path = this.extractPathForMetrics(request)
        const exceptionType = this.extractExceptionType(exception)
        
        this.metricsProvider.recordHttpException(method, path, exceptionType)
        this.logger.debug(`Recorded exception metric: ${method} ${path} ${exceptionType}`)
      } catch (metricsError) {
        this.logger.warn(`Failed to record exception metric: ${metricsError}`)
      }
    }

    if (host.getType() === 'http') {
      httpAdapter.reply(ctx.getResponse(), response, status)
    }
  }

  private extractPathForMetrics(request: Request): string {
    let path = request.path || request.url || '/unknown'
    
    // Remove API prefix
    if (path.startsWith('/api/v1/') || path.startsWith('/api/1/')) {
      path = path.replace(/^\/api\/(v1|1)/, '')
    } else if (path.startsWith('/api/')) {
      path = path.replace(/^\/api/, '')
    }
    
    // Use route pattern if available
    if (request.route?.path) {
      return request.route.path
    }
    
    return path || '/unknown'
  }

  private extractExceptionType(exception: unknown): string {
    if (exception instanceof ServiceNotFoundError) return 'ServiceNotFoundError'
    if (exception instanceof ServiceInvalidArgumentError) return 'ServiceInvalidArgumentError'
    if (exception instanceof ServiceInvalidRequestError) return 'ServiceInvalidRequestError'
    if (exception instanceof ServiceAlreadyExistsError) return 'ServiceAlreadyExistsError'
    if (exception instanceof ServiceUnImplementedError) return 'ServiceUnImplementedError'
    if (exception instanceof ServiceUnauthorizedError) return 'ServiceUnauthorizedError'
    if (exception instanceof ServiceInternalServerError) return 'ServiceInternalServerError'
    if (exception instanceof ServiceTimeoutError) return 'ServiceTimeoutError'
    if (exception instanceof IntegrationServiceUnauthorizedError) return 'IntegrationServiceUnauthorizedError'
    if (exception instanceof IntegrationExternalServiceError) return 'IntegrationExternalServiceError'
    if (exception instanceof ProviderInternalValidationError) return 'ProviderInternalValidationError'
    if (exception instanceof HttpException) return 'HttpException'
    if (exception instanceof BaseError) return 'BaseError'
    
    return exception?.constructor?.name || 'UnknownError'
  }
}

export const exceptionHandlerProvider = {
  provide: APP_FILTER,
  useClass: ExceptionHandler
}
