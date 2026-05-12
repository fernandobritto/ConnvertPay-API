import { MetricsMiddleware } from 'src/adapters/inbound/middlewares/metrics.middleware'
import {
  IMetricsProvider,
  METRICS_PROVIDER
} from 'src/ports/outbound/providers/metrics/metrics.interface'
import { Test, TestingModule } from '@nestjs/testing'
import { Request, Response, NextFunction } from 'express'

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
  getMetricsContentType: jest.fn().mockReturnValue('text/plain; version=0.0.4'),
  resetMetrics: jest.fn()
}

function buildMockResponse(): jest.Mocked<Partial<Response>> & { headers: Record<string, string> } {
  const headers: Record<string, string> = {}
  return {
    headers,
    setHeader: jest.fn((key: string, value: string) => {
      headers[key] = value
    }) as any
  }
}

describe('MetricsMiddleware', () => {
  let middleware: MetricsMiddleware
  let nextFn: NextFunction

  beforeEach(async () => {
    jest.clearAllMocks()
    nextFn = jest.fn()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsMiddleware,
        { provide: METRICS_PROVIDER, useValue: mockMetricsProvider }
      ]
    }).compile()

    middleware = module.get<MetricsMiddleware>(MetricsMiddleware)
  })

  describe('use – metrics path', () => {
    it('should set Content-Type header for the /metrics path', () => {
      const req = { path: '/metrics' } as unknown as Request
      const res = buildMockResponse()

      middleware.use(req, res as unknown as Response, nextFn)

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/plain; version=0.0.4'
      )
    })

    it('should set Cache-Control no-cache headers for /metrics', () => {
      const req = { path: '/metrics' } as unknown as Request
      const res = buildMockResponse()

      middleware.use(req, res as unknown as Response, nextFn)

      expect(res.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'no-cache, no-store, must-revalidate'
      )
      expect(res.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache')
      expect(res.setHeader).toHaveBeenCalledWith('Expires', '0')
    })

    it('should always call next()', () => {
      const req = { path: '/metrics' } as unknown as Request
      const res = buildMockResponse()

      middleware.use(req, res as unknown as Response, nextFn)

      expect(nextFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('use – non-metrics path', () => {
    it('should NOT set any headers for non-metrics paths', () => {
      const req = { path: '/account' } as unknown as Request
      const res = buildMockResponse()

      middleware.use(req, res as unknown as Response, nextFn)

      expect(res.setHeader).not.toHaveBeenCalled()
    })

    it('should still call next() for non-metrics paths', () => {
      const req = { path: '/account' } as unknown as Request
      const res = buildMockResponse()

      middleware.use(req, res as unknown as Response, nextFn)

      expect(nextFn).toHaveBeenCalledTimes(1)
    })
  })
})
