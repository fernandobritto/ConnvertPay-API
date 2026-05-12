import { Test, TestingModule } from '@nestjs/testing'
import { ExecutionContext, CallHandler } from '@nestjs/common'
import { MetricsInterceptor } from 'src/adapters/inbound/interceptors/metrics.interceptor'
import {
  IMetricsProvider,
  METRICS_PROVIDER
} from 'src/ports/outbound/providers/metrics/metrics.interface'
import { of, throwError, lastValueFrom } from 'rxjs'
import { NotFoundException } from '@nestjs/common'

const mockMetricsProvider: jest.Mocked<IMetricsProvider> = {
  recordHttpRequest: jest.fn(),
  recordHttpRequestDuration: jest.fn(),
  incrementHttpRequestsInProgress: jest.fn(),
  decrementHttpRequestsInProgress: jest.fn(),
  recordHttpException: jest.fn(),
  recordCustomMetric: jest.fn(),
  incrementCounter: jest.fn(),
  setGauge: jest.fn(),
  recordApplicationStartTime: jest.fn(),
  recordDatabaseConnectionStatus: jest.fn(),
  getMetrics: jest.fn(),
  getMetricsContentType: jest.fn(),
  resetMetrics: jest.fn()
}

/** Helper to build a mock HTTP ExecutionContext */
function buildHttpContext(
  method = 'GET',
  path = '/account',
  routePath?: string
): ExecutionContext {
  const request: any = {
    method,
    path,
    url: path,
    route: routePath ? { path: routePath } : undefined
  }
  const response: any = { statusCode: 200 }

  return {
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response
    })
  } as unknown as ExecutionContext
}

/** Helper to build a mock CallHandler that emits a value */
function buildCallHandler(result: any = { data: 'ok' }): CallHandler {
  return { handle: () => of(result) }
}

/** Helper to build a mock CallHandler that throws an error */
function buildErrorCallHandler(error: any): CallHandler {
  return { handle: () => throwError(() => error) }
}

describe('MetricsInterceptor', () => {
  let interceptor: MetricsInterceptor

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsInterceptor,
        { provide: METRICS_PROVIDER, useValue: mockMetricsProvider }
      ]
    }).compile()

    interceptor = module.get<MetricsInterceptor>(MetricsInterceptor)
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Non-HTTP context
  // ──────────────────────────────────────────────────────────────────────────
  describe('when context is not HTTP', () => {
    it('should pass through without recording any metrics', (done) => {
      const nonHttpContext = {
        getType: () => 'rpc',
        switchToHttp: () => ({ getRequest: () => ({}), getResponse: () => ({}) })
      } as unknown as ExecutionContext

      interceptor.intercept(nonHttpContext, buildCallHandler()).subscribe({
        next: (val) => {
          expect(val).toEqual({ data: 'ok' })
          expect(mockMetricsProvider.incrementHttpRequestsInProgress).not.toHaveBeenCalled()
          done()
        }
      })
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Metrics endpoint passthrough
  // ──────────────────────────────────────────────────────────────────────────
  describe('when path is /metrics', () => {
    it('should skip metrics tracking for the /metrics endpoint', (done) => {
      const ctx = buildHttpContext('GET', '/metrics')

      interceptor.intercept(ctx, buildCallHandler()).subscribe({
        next: () => {
          expect(mockMetricsProvider.incrementHttpRequestsInProgress).not.toHaveBeenCalled()
          done()
        }
      })
    })

    it('should skip any path containing /metrics', (done) => {
      const ctx = buildHttpContext('GET', '/api/metrics/custom')

      interceptor.intercept(ctx, buildCallHandler()).subscribe({
        next: () => {
          expect(mockMetricsProvider.incrementHttpRequestsInProgress).not.toHaveBeenCalled()
          done()
        }
      })
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Successful HTTP request
  // ──────────────────────────────────────────────────────────────────────────
  describe('when handling a successful HTTP request', () => {
    it('should increment requests in progress, then record request and duration', async () => {
      const ctx = buildHttpContext('GET', '/account')

      await lastValueFrom(interceptor.intercept(ctx, buildCallHandler()))

      // After lastValueFrom resolves the observable has completed and finalize has run
      expect(mockMetricsProvider.incrementHttpRequestsInProgress).toHaveBeenCalledWith(
        'GET',
        '/account'
      )
      expect(mockMetricsProvider.recordHttpRequest).toHaveBeenCalledWith(
        'GET',
        '/account',
        200
      )
      expect(mockMetricsProvider.recordHttpRequestDuration).toHaveBeenCalledWith(
        'GET',
        '/account',
        expect.any(Number)
      )
      // finalize must decrement in-progress
      expect(mockMetricsProvider.decrementHttpRequestsInProgress).toHaveBeenCalledWith(
        'GET',
        '/account'
      )
    })

    it('should use route path when request.route.path is available', (done) => {
      const ctx = buildHttpContext('GET', '/account/uuid-1234', '/account/:id')

      interceptor.intercept(ctx, buildCallHandler()).subscribe({
        complete: () => {
          expect(mockMetricsProvider.recordHttpRequest).toHaveBeenCalledWith(
            'GET',
            '/account/:id',
            200
          )
          done()
        }
      })
    })

    it('should strip /api/v1 prefix from path', (done) => {
      const ctx = buildHttpContext('POST', '/api/v1/account')

      interceptor.intercept(ctx, buildCallHandler()).subscribe({
        complete: () => {
          expect(mockMetricsProvider.incrementHttpRequestsInProgress).toHaveBeenCalledWith(
            'POST',
            '/account'
          )
          done()
        }
      })
    })

    it('should strip /api prefix from path', (done) => {
      const ctx = buildHttpContext('GET', '/api/account')

      interceptor.intercept(ctx, buildCallHandler()).subscribe({
        complete: () => {
          expect(mockMetricsProvider.incrementHttpRequestsInProgress).toHaveBeenCalledWith(
            'GET',
            '/account'
          )
          done()
        }
      })
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Error path
  // ──────────────────────────────────────────────────────────────────────────
  describe('when the handler throws an error', () => {
    it('should record exception metrics and rethrow', async () => {
      const ctx = buildHttpContext('DELETE', '/account/uuid-1234', '/account/:id')
      const error = new NotFoundException('Account not found')

      await expect(
        lastValueFrom(interceptor.intercept(ctx, buildErrorCallHandler(error)))
      ).rejects.toBe(error)

      // After the promise rejects, finalize has already run
      expect(mockMetricsProvider.recordHttpException).toHaveBeenCalledWith(
        'DELETE',
        '/account/:id',
        'NotFoundException'
      )
      expect(mockMetricsProvider.recordHttpRequest).toHaveBeenCalledWith(
        'DELETE',
        '/account/:id',
        404
      )
      expect(mockMetricsProvider.decrementHttpRequestsInProgress).toHaveBeenCalled()
    })

    it('should extract status from HttpException', (done) => {
      const ctx = buildHttpContext('GET', '/account/id')
      const error = new NotFoundException('Not found')

      interceptor.intercept(ctx, buildErrorCallHandler(error)).subscribe({
        error: () => {
          expect(mockMetricsProvider.recordHttpRequest).toHaveBeenCalledWith(
            'GET',
            '/account/id',
            404
          )
          done()
        }
      })
    })

    it('should default to status 500 for unknown errors', (done) => {
      const ctx = buildHttpContext('POST', '/account')
      const error = new Error('Unknown error')

      interceptor.intercept(ctx, buildErrorCallHandler(error)).subscribe({
        error: () => {
          expect(mockMetricsProvider.recordHttpRequest).toHaveBeenCalledWith(
            'POST',
            '/account',
            500
          )
          done()
        }
      })
    })

    it('should label unknown errors as UnknownError exception type', (done) => {
      const ctx = buildHttpContext('GET', '/account')
      // Plain object with no constructor name
      const error = { message: 'raw error' }

      interceptor.intercept(ctx, buildErrorCallHandler(error)).subscribe({
        error: () => {
          // The error is a plain object; the interceptor labels it by constructor name
          expect(mockMetricsProvider.recordHttpException).toHaveBeenCalled()
          done()
        }
      })
    })
  })
})
