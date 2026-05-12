import { HttpException, HttpStatus } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { ExceptionHandler } from 'src/adapters/inbound/middlewares/exception-filter.middleware'
import { DateProvider } from 'src/adapters/outbound/providers/date/date.provider'
import {
  ServiceNotFoundError,
  ServiceInvalidArgumentError,
  ServiceInvalidRequestError,
  ServiceAlreadyExistsError,
  ServiceUnImplementedError,
  ServiceUnauthorizedError,
  ServiceInternalServerError,
  ServiceTimeoutError
} from 'src/common/errors/services-errors'
import {
  IntegrationExternalServiceError,
  IntegrationServiceUnauthorizedError,
  ProviderInternalValidationError
} from 'src/common/errors/integrations-errors'
import {
  IMetricsProvider
} from 'src/ports/outbound/providers/metrics/metrics.interface'

// ──────────────────────────────────────────────────────────────────────────
// Helpers / Mocks
// ──────────────────────────────────────────────────────────────────────────
const mockReply = jest.fn()
const mockHttpAdapterHost = {
  httpAdapter: { reply: mockReply }
} as unknown as HttpAdapterHost

const fixedDate = new Date('2024-06-01T12:00:00.000Z')
const mockDateProvider = {
  getCurrentDate: jest.fn().mockReturnValue(fixedDate)
} as unknown as DateProvider

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

/** Build a minimal ArgumentsHost for HTTP requests */
function buildHttpHost(
  method = 'GET',
  path = '/account',
  routePath?: string
) {
  const request: any = { method, path, url: path, route: routePath ? { path: routePath } : undefined }
  const response: any = {}
  return {
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response
    })
  } as any
}

describe('ExceptionHandler', () => {
  let handler: ExceptionHandler

  beforeEach(() => {
    jest.clearAllMocks()
    handler = new ExceptionHandler(
      mockHttpAdapterHost,
      mockDateProvider,
      mockMetricsProvider
    )
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Status code mapping
  // ──────────────────────────────────────────────────────────────────────────
  describe('HTTP status code mapping', () => {
    const cases: [unknown, number][] = [
      [new HttpException('bad request', HttpStatus.BAD_REQUEST), 400],
      [new ServiceNotFoundError('not found'), 404],
      [new ServiceInvalidArgumentError('invalid arg'), 400],
      [new ServiceInvalidRequestError('invalid req'), 400],
      [new ServiceAlreadyExistsError('conflict'), 409],
      [new ServiceUnImplementedError('not impl'), 501],
      [new ServiceUnauthorizedError('unauth'), 401],
      [new ServiceInternalServerError('internal'), 500],
      [new IntegrationServiceUnauthorizedError('integration unauth'), 401],
      [new IntegrationExternalServiceError('ext error', 503), 503],
      [new ProviderInternalValidationError('validation', 400), 400],
      [new ServiceTimeoutError('timeout', 408), 408],
      [new Error('unknown'), 500]
    ]

    test.each(cases)(
      'should reply with correct status for %s',
      (exception, expectedStatus) => {
        const host = buildHttpHost()

        handler.catch(exception, host)

        expect(mockReply).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ statusCode: expectedStatus }),
          expectedStatus
        )
      }
    )
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Response body shape
  // ──────────────────────────────────────────────────────────────────────────
  describe('response body', () => {
    it('should include statusCode, message, parameters, and timestamp', () => {
      const exception = new ServiceNotFoundError('Account not found', {
        id: 'uuid-1234'
      })
      const host = buildHttpHost()

      handler.catch(exception, host)

      expect(mockReply).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          statusCode: 404,
          message: 'Account not found',
          parameters: { id: 'uuid-1234' },
          timestamp: fixedDate.toISOString()
        }),
        404
      )
    })

    it('should extract response from HttpException as parameters', () => {
      const exception = new HttpException('Forbidden', 403)
      const host = buildHttpHost()

      handler.catch(exception, host)

      expect(mockReply).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ statusCode: 403 }),
        403
      )
    })

    it('should use "Error" as message for non-Error exceptions', () => {
      const exception = 'raw string exception'
      const host = buildHttpHost()

      handler.catch(exception, host)

      expect(mockReply).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ message: 'Error' }),
        500
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Metrics recording
  // ──────────────────────────────────────────────────────────────────────────
  describe('metrics recording', () => {
    it('should record exception metric for HTTP context', () => {
      const exception = new ServiceNotFoundError('not found')
      const host = buildHttpHost('GET', '/account/id', '/account/:id')

      handler.catch(exception, host)

      expect(mockMetricsProvider.recordHttpException).toHaveBeenCalledWith(
        'GET',
        '/account/:id',
        'ServiceNotFoundError'
      )
    })

    it('should not throw when metrics recording fails', () => {
      mockMetricsProvider.recordHttpException.mockImplementationOnce(() => {
        throw new Error('metrics error')
      })
      const exception = new ServiceNotFoundError('not found')
      const host = buildHttpHost()

      // Should not throw
      expect(() => handler.catch(exception, host)).not.toThrow()
    })

    it('should not record metrics for non-HTTP context', () => {
      const exception = new Error('rpc error')
      const rpcHost = {
        getType: () => 'rpc',
        switchToHttp: () => ({ getRequest: () => ({}), getResponse: () => ({}) })
      } as any

      handler.catch(exception, rpcHost)

      expect(mockMetricsProvider.recordHttpException).not.toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // Exception type extraction
  // ──────────────────────────────────────────────────────────────────────────
  describe('exception type extraction', () => {
    const typeCases: [unknown, string][] = [
      [new ServiceNotFoundError('x'), 'ServiceNotFoundError'],
      [new ServiceInvalidArgumentError('x'), 'ServiceInvalidArgumentError'],
      [new ServiceInvalidRequestError('x'), 'ServiceInvalidRequestError'],
      [new ServiceAlreadyExistsError('x'), 'ServiceAlreadyExistsError'],
      [new ServiceUnImplementedError('x'), 'ServiceUnImplementedError'],
      [new ServiceUnauthorizedError('x'), 'ServiceUnauthorizedError'],
      [new ServiceInternalServerError('x'), 'ServiceInternalServerError'],
      [new ServiceTimeoutError('x'), 'ServiceTimeoutError'],
      [new IntegrationServiceUnauthorizedError('x'), 'IntegrationServiceUnauthorizedError'],
      [new IntegrationExternalServiceError('x'), 'IntegrationExternalServiceError'],
      [new ProviderInternalValidationError('x'), 'ProviderInternalValidationError']
    ]

    test.each(typeCases)(
      'should label exception %s correctly',
      (exception, expectedType) => {
        const host = buildHttpHost()

        handler.catch(exception, host)

        expect(mockMetricsProvider.recordHttpException).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expectedType
        )
      }
    )
  })

  // ──────────────────────────────────────────────────────────────────────────
  // IntegrationExternalServiceError with default status
  // ──────────────────────────────────────────────────────────────────────────
  describe('IntegrationExternalServiceError without custom status', () => {
    it('should default to 500 when no status is provided', () => {
      const exception = new IntegrationExternalServiceError('ext error')
      const host = buildHttpHost()

      handler.catch(exception, host)

      expect(mockReply).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ statusCode: 500 }),
        500
      )
    })
  })
})
