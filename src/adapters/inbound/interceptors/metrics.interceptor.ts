import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError, finalize, tap } from 'rxjs/operators'
import { Request, Response } from 'express'
import {
  IMetricsProvider,
  METRICS_PROVIDER
} from 'src/ports/outbound/providers/metrics/metrics.interface'

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MetricsInterceptor.name)

  constructor(
    @Inject(METRICS_PROVIDER)
    private readonly metricsProvider: IMetricsProvider
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Only process HTTP requests
    if (context.getType() !== 'http') {
      return next.handle()
    }

    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()

    const method = request.method
    const path = this.extractPathFromRequest(request)
    const startTime = Date.now()

    // Skip metrics endpoint to avoid recursion
    if (path === '/metrics' || path.includes('/metrics')) {
      return next.handle()
    }

    this.logger.debug(`Starting HTTP request tracking: ${method} ${path}`)

    // Increment requests in progress
    this.metricsProvider.incrementHttpRequestsInProgress(method, path)

    return next.handle().pipe(
      tap(() => {
        // Success path - record metrics on successful completion
        const duration = (Date.now() - startTime) / 1000
        const statusCode = response.statusCode

        this.metricsProvider.recordHttpRequest(method, path, statusCode)
        this.metricsProvider.recordHttpRequestDuration(method, path, duration)

        this.logger.debug(
          `HTTP request completed successfully: ${method} ${path} ${statusCode} (${duration}s)`
        )
      }),
      catchError((error) => {
        // Error path - record exception metrics
        const duration = (Date.now() - startTime) / 1000
        const statusCode = this.extractStatusCodeFromError(error, response)
        const exceptionType = this.extractExceptionType(error)

        this.metricsProvider.recordHttpRequest(method, path, statusCode)
        this.metricsProvider.recordHttpRequestDuration(method, path, duration)
        this.metricsProvider.recordHttpException(method, path, exceptionType)

        this.logger.debug(
          `HTTP request failed: ${method} ${path} ${statusCode} ${exceptionType} (${duration}s)`
        )

        // Re-throw the error to maintain normal error handling flow
        return throwError(() => error)
      }),
      finalize(() => {
        // Always decrement requests in progress counter
        this.metricsProvider.decrementHttpRequestsInProgress(method, path)
        this.logger.debug(`HTTP request tracking finalized: ${method} ${path}`)
      })
    )
  }

  /**
   * Extracts a clean path from the request for metrics
   * Removes API versioning prefix and sanitizes parameters
   */
  private extractPathFromRequest(request: Request): string {
    let path = request.path || request.url

    // Remove API prefix and version from path for cleaner metrics
    if (path.startsWith('/api/v1/') || path.startsWith('/api/1/')) {
      path = path.replace(/^\/api\/(v1|1)/, '')
    } else if (path.startsWith('/api/')) {
      path = path.replace(/^\/api/, '')
    }

    // Ensure path starts with /
    if (!path.startsWith('/')) {
      path = `/${path}`
    }

    // Use route pattern if available (better for metrics)
    if (request.route?.path) {
      let routePath = request.route.path

      // Remove API prefix from route path too
      if (routePath.startsWith('/api/v1/') || routePath.startsWith('/api/1/')) {
        routePath = routePath.replace(/^\/api\/(v1|1)/, '')
      } else if (routePath.startsWith('/api/')) {
        routePath = routePath.replace(/^\/api/, '')
      }

      if (!routePath.startsWith('/')) {
        routePath = `/${routePath}`
      }

      return routePath
    }

    return path
  }

  /**
   * Extracts status code from error or response
   */
  private extractStatusCodeFromError(error: any, response: Response): number {
    // If error has status property (HttpException)
    if (error?.status) {
      return error.status
    }

    // If error has getStatus method (NestJS exceptions)
    if (typeof error?.getStatus === 'function') {
      return error.getStatus()
    }

    // If response already has a status code set
    if (response.statusCode && response.statusCode !== 200) {
      return response.statusCode
    }

    // Default to 500 for unknown errors
    return 500
  }

  /**
   * Extracts exception type for metrics labeling
   */
  private extractExceptionType(error: any): string {
    // Use constructor name if available
    if (error?.constructor?.name) {
      return error.constructor.name
    }

    // Use error name if available
    if (error?.name) {
      return error.name
    }

    // Check for specific error types
    if (error?.message?.includes('timeout')) {
      return 'TimeoutError'
    }

    if (error?.message?.includes('validation')) {
      return 'ValidationError'
    }

    if (
      error?.message?.includes('authorization') ||
      error?.message?.includes('unauthorized')
    ) {
      return 'AuthorizationError'
    }

    if (error?.message?.includes('not found')) {
      return 'NotFoundError'
    }

    // Default fallback
    return 'UnknownError'
  }
}
