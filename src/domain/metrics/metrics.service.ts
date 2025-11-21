import { Inject, Injectable, Logger } from '@nestjs/common'
import {
  IMetricsProvider,
  METRICS_PROVIDER
} from 'src/ports/outbound/providers/metrics/metrics.interface'

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name)

  constructor(
    @Inject(METRICS_PROVIDER)
    private readonly metricsProvider: IMetricsProvider
  ) {}

  /**
   * Record business-specific metrics
   */
  recordAccountCreation(): void {
    this.metricsProvider.incrementCounter('account_created', {
      operation: 'create'
    })
    this.logger.debug('Recorded account creation metric')
  }

  recordAccountUpdate(): void {
    this.metricsProvider.incrementCounter('account_updated', {
      operation: 'update'
    })
    this.logger.debug('Recorded account update metric')
  }

  recordAccountDeletion(): void {
    this.metricsProvider.incrementCounter('account_deleted', {
      operation: 'delete'
    })
    this.logger.debug('Recorded account deletion metric')
  }

  recordAccountQuery(): void {
    this.metricsProvider.incrementCounter('account_queried', {
      operation: 'read'
    })
    this.logger.debug('Recorded account query metric')
  }

  recordDatabaseOperation(operation: string, duration: number): void {
    this.metricsProvider.recordCustomMetric(
      'database_operation_duration_seconds',
      duration,
      {
        operation
      }
    )
    this.metricsProvider.incrementCounter('database_operations', { operation })
    this.logger.debug(
      `Recorded database operation: ${operation} (${duration}s)`
    )
  }

  recordBusinessValidationError(errorType: string): void {
    this.metricsProvider.incrementCounter('business_validation_errors', {
      error_type: errorType
    })
    this.logger.debug(`Recorded business validation error: ${errorType}`)
  }

  setActiveUsersCount(count: number): void {
    this.metricsProvider.setGauge('active_users_count', count)
    this.logger.debug(`Set active users count: ${count}`)
  }

  recordCustomEvent(
    eventName: string,
    labels: Record<string, string> = {}
  ): void {
    this.metricsProvider.incrementCounter(`custom_event_${eventName}`, labels)
    this.logger.debug(`Recorded custom event: ${eventName}`)
  }
}
