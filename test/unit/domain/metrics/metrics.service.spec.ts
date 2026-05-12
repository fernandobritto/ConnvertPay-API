import { Test, TestingModule } from '@nestjs/testing'
import { MetricsService } from 'src/domain/metrics/metrics.service'
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

describe('MetricsService', () => {
  let service: MetricsService

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        { provide: METRICS_PROVIDER, useValue: mockMetricsProvider }
      ]
    }).compile()

    service = module.get<MetricsService>(MetricsService)
  })

  describe('recordAccountCreation', () => {
    it('should increment the account_created counter', () => {
      service.recordAccountCreation()

      expect(mockMetricsProvider.incrementCounter).toHaveBeenCalledWith(
        'account_created',
        { operation: 'create' }
      )
    })
  })

  describe('recordAccountUpdate', () => {
    it('should increment the account_updated counter', () => {
      service.recordAccountUpdate()

      expect(mockMetricsProvider.incrementCounter).toHaveBeenCalledWith(
        'account_updated',
        { operation: 'update' }
      )
    })
  })

  describe('recordAccountDeletion', () => {
    it('should increment the account_deleted counter', () => {
      service.recordAccountDeletion()

      expect(mockMetricsProvider.incrementCounter).toHaveBeenCalledWith(
        'account_deleted',
        { operation: 'delete' }
      )
    })
  })

  describe('recordAccountQuery', () => {
    it('should increment the account_queried counter', () => {
      service.recordAccountQuery()

      expect(mockMetricsProvider.incrementCounter).toHaveBeenCalledWith(
        'account_queried',
        { operation: 'read' }
      )
    })
  })

  describe('recordDatabaseOperation', () => {
    it('should record a custom metric and increment counter', () => {
      service.recordDatabaseOperation('account_create', 0.05)

      expect(mockMetricsProvider.recordCustomMetric).toHaveBeenCalledWith(
        'database_operation_duration_seconds',
        0.05,
        { operation: 'account_create' }
      )
      expect(mockMetricsProvider.incrementCounter).toHaveBeenCalledWith(
        'database_operations',
        { operation: 'account_create' }
      )
    })

    it('should handle zero duration', () => {
      service.recordDatabaseOperation('account_find_all', 0)

      expect(mockMetricsProvider.recordCustomMetric).toHaveBeenCalledWith(
        'database_operation_duration_seconds',
        0,
        { operation: 'account_find_all' }
      )
    })

    it('should handle large duration values', () => {
      service.recordDatabaseOperation('slow_query', 10.5)

      expect(mockMetricsProvider.recordCustomMetric).toHaveBeenCalledWith(
        'database_operation_duration_seconds',
        10.5,
        { operation: 'slow_query' }
      )
    })
  })

  describe('recordBusinessValidationError', () => {
    it('should increment business_validation_errors counter with error_type label', () => {
      service.recordBusinessValidationError('account_creation_failed')

      expect(mockMetricsProvider.incrementCounter).toHaveBeenCalledWith(
        'business_validation_errors',
        { error_type: 'account_creation_failed' }
      )
    })

    it('should handle different error type strings', () => {
      service.recordBusinessValidationError('account_query_failed')

      expect(mockMetricsProvider.incrementCounter).toHaveBeenCalledWith(
        'business_validation_errors',
        { error_type: 'account_query_failed' }
      )
    })
  })

  describe('setActiveUsersCount', () => {
    it('should set active_users_count gauge', () => {
      service.setActiveUsersCount(42)

      expect(mockMetricsProvider.setGauge).toHaveBeenCalledWith(
        'active_users_count',
        42
      )
    })

    it('should handle zero active users', () => {
      service.setActiveUsersCount(0)

      expect(mockMetricsProvider.setGauge).toHaveBeenCalledWith(
        'active_users_count',
        0
      )
    })
  })

  describe('recordCustomEvent', () => {
    it('should increment a custom event counter with provided labels', () => {
      service.recordCustomEvent('payment_processed', { type: 'credit' })

      expect(mockMetricsProvider.incrementCounter).toHaveBeenCalledWith(
        'custom_event_payment_processed',
        { type: 'credit' }
      )
    })

    it('should use empty labels object when none provided', () => {
      service.recordCustomEvent('user_logged_in')

      expect(mockMetricsProvider.incrementCounter).toHaveBeenCalledWith(
        'custom_event_user_logged_in',
        {}
      )
    })
  })
})
