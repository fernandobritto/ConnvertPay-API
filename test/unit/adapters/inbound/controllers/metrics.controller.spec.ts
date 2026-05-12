import { Test, TestingModule } from '@nestjs/testing'
import { InternalServerErrorException } from '@nestjs/common'
import { MetricsController } from 'src/adapters/inbound/controllers/metrics.controller'
import {
  IMetricsProvider,
  METRICS_PROVIDER
} from 'src/ports/outbound/providers/metrics/metrics.interface'

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

describe('MetricsController', () => {
  let controller: MetricsController

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [{ provide: METRICS_PROVIDER, useValue: mockMetricsProvider }]
    }).compile()

    controller = module.get<MetricsController>(MetricsController)
  })

  // ──────────────────────────────────────────────────────────────────────────
  // GET /metrics
  // ──────────────────────────────────────────────────────────────────────────
  describe('getMetrics', () => {
    it('should return the metrics string from the provider', async () => {
      const prometheusOutput = '# HELP http_requests_total\nhttp_requests_total 42'
      mockMetricsProvider.getMetrics.mockResolvedValue(prometheusOutput)

      const result = await controller.getMetrics()

      expect(result).toBe(prometheusOutput)
      expect(mockMetricsProvider.getMetrics).toHaveBeenCalledTimes(1)
    })

    it('should throw InternalServerErrorException when provider fails', async () => {
      mockMetricsProvider.getMetrics.mockRejectedValue(
        new Error('Registry error')
      )

      await expect(controller.getMetrics()).rejects.toThrow(
        InternalServerErrorException
      )
    })

    it('should return an empty string when provider returns empty metrics', async () => {
      mockMetricsProvider.getMetrics.mockResolvedValue('')

      const result = await controller.getMetrics()

      expect(result).toBe('')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // GET /health
  // ──────────────────────────────────────────────────────────────────────────
  describe('healthCheck', () => {
    it('should return status ok', async () => {
      const result = await controller.healthCheck()

      expect(result.status).toBe('ok')
    })

    it('should include a timestamp in ISO format', async () => {
      const result = await controller.healthCheck()

      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z$/
      )
    })

    it('should include uptime as a number', async () => {
      const result = await controller.healthCheck()

      expect(typeof result.uptime).toBe('number')
      expect(result.uptime).toBeGreaterThanOrEqual(0)
    })

    it('should include memory usage info', async () => {
      const result = await controller.healthCheck()

      expect(result.memory).toBeDefined()
      expect(result.memory).toHaveProperty('rss')
      expect(result.memory).toHaveProperty('heapUsed')
    })

    it('should indicate prometheus as the metrics provider', async () => {
      const result = await controller.healthCheck()

      expect(result.metrics_provider).toBe('prometheus')
    })
  })
})
