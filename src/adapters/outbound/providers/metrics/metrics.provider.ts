import { Injectable, Logger } from '@nestjs/common'
import { IMetricsProvider } from 'src/ports/outbound/providers/metrics/metrics.interface'
import * as promClient from 'prom-client'

@Injectable()
export class PrometheusMetricsProvider implements IMetricsProvider {
  private readonly logger = new Logger(PrometheusMetricsProvider.name)
  private readonly registry: promClient.Registry

  // HTTP Metrics
  private readonly httpRequestsTotal: promClient.Counter<string>
  private readonly httpRequestDurationHistogram: promClient.Histogram<string>
  private readonly httpRequestsInProgress: promClient.Gauge<string>
  private readonly httpExceptionsTotal: promClient.Counter<string>

  // Application Metrics
  private readonly applicationStartTime: promClient.Gauge<string>
  private readonly databaseConnectionStatus: promClient.Gauge<string>

  // Custom metrics storage
  private readonly customCounters = new Map<
    string,
    promClient.Counter<string>
  >()
  private readonly customGauges = new Map<string, promClient.Gauge<string>>()

  constructor() {
    // Create separate registry for better isolation
    this.registry = new promClient.Registry()

    // Configure default metrics collection
    this.setupDefaultMetrics()

    // Initialize HTTP metrics
    this.httpRequestsTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status_code'],
      registers: [this.registry]
    })

    this.httpRequestDurationHistogram = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path'],
      buckets: [
        0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1.0, 2.0, 5.0
      ],
      registers: [this.registry]
    })

    this.httpRequestsInProgress = new promClient.Gauge({
      name: 'http_requests_in_progress',
      help: 'Number of HTTP requests currently in progress',
      labelNames: ['method', 'path'],
      registers: [this.registry]
    })

    this.httpExceptionsTotal = new promClient.Counter({
      name: 'http_exceptions_total',
      help: 'Total number of HTTP exceptions',
      labelNames: ['method', 'path', 'exception_type'],
      registers: [this.registry]
    })

    // Initialize application metrics
    this.applicationStartTime = new promClient.Gauge({
      name: 'application_start_time_seconds',
      help: 'Time when the application started (Unix timestamp)',
      registers: [this.registry]
    })

    this.databaseConnectionStatus = new promClient.Gauge({
      name: 'database_connection_status',
      help: 'Database connection status (1 = connected, 0 = disconnected)',
      labelNames: ['database_name'],
      registers: [this.registry]
    })

    this.logger.log('Prometheus metrics provider initialized')
    this.recordApplicationStartTime()
  }

  private setupDefaultMetrics(): void {
    // Collect default NodeJS metrics (memory, CPU, etc.)
    promClient.collectDefaultMetrics({
      register: this.registry,
      prefix: 'connvertpay_',
      labels: {
        service: 'connvertpay-api',
        version: process.env.npm_package_version || '0.1.0'
      }
    })
  }

  recordHttpRequest(method: string, path: string, statusCode: number): void {
    try {
      const sanitizedPath = this.sanitizePathForMetrics(path)
      this.httpRequestsTotal
        .labels(method, sanitizedPath, statusCode.toString())
        .inc()

      this.logger.debug(
        `Recorded HTTP request: ${method} ${sanitizedPath} ${statusCode}`
      )
    } catch (error) {
      this.logger.error(`Error recording HTTP request metric: ${error}`)
    }
  }

  recordHttpRequestDuration(
    method: string,
    path: string,
    durationSeconds: number
  ): void {
    try {
      const sanitizedPath = this.sanitizePathForMetrics(path)
      this.httpRequestDurationHistogram
        .labels(method, sanitizedPath)
        .observe(durationSeconds)

      this.logger.debug(
        `Recorded HTTP duration: ${method} ${sanitizedPath} ${durationSeconds}s`
      )
    } catch (error) {
      this.logger.error(`Error recording HTTP duration metric: ${error}`)
    }
  }

  incrementHttpRequestsInProgress(method: string, path: string): void {
    try {
      const sanitizedPath = this.sanitizePathForMetrics(path)
      this.httpRequestsInProgress.labels(method, sanitizedPath).inc()
    } catch (error) {
      this.logger.error(
        `Error incrementing HTTP requests in progress: ${error}`
      )
    }
  }

  decrementHttpRequestsInProgress(method: string, path: string): void {
    try {
      const sanitizedPath = this.sanitizePathForMetrics(path)
      this.httpRequestsInProgress.labels(method, sanitizedPath).dec()
    } catch (error) {
      this.logger.error(
        `Error decrementing HTTP requests in progress: ${error}`
      )
    }
  }

  recordHttpException(
    method: string,
    path: string,
    exceptionType: string
  ): void {
    try {
      const sanitizedPath = this.sanitizePathForMetrics(path)
      this.httpExceptionsTotal
        .labels(method, sanitizedPath, exceptionType)
        .inc()

      this.logger.debug(
        `Recorded HTTP exception: ${method} ${sanitizedPath} ${exceptionType}`
      )
    } catch (error) {
      this.logger.error(`Error recording HTTP exception metric: ${error}`)
    }
  }

  recordCustomMetric(
    name: string,
    value: number,
    labels: Record<string, string> = {}
  ): void {
    try {
      const labelNames = Object.keys(labels)
      const labelValues = Object.values(labels)

      // Create or get existing gauge
      if (!this.customGauges.has(name)) {
        this.customGauges.set(
          name,
          new promClient.Gauge({
            name: `custom_${name}`,
            help: `Custom metric: ${name}`,
            labelNames,
            registers: [this.registry]
          })
        )
      }

      const gauge = this.customGauges.get(name)
      if (labelNames.length > 0) {
        gauge?.labels(...labelValues).set(value)
      } else {
        gauge?.set(value)
      }

      this.logger.debug(`Recorded custom metric: ${name} = ${value}`)
    } catch (error) {
      this.logger.error(`Error recording custom metric: ${error}`)
    }
  }

  incrementCounter(name: string, labels: Record<string, string> = {}): void {
    try {
      const labelNames = Object.keys(labels)
      const labelValues = Object.values(labels)

      // Create or get existing counter
      if (!this.customCounters.has(name)) {
        this.customCounters.set(
          name,
          new promClient.Counter({
            name: `custom_${name}_total`,
            help: `Custom counter: ${name}`,
            labelNames,
            registers: [this.registry]
          })
        )
      }

      const counter = this.customCounters.get(name)
      if (labelNames.length > 0) {
        counter?.labels(...labelValues).inc()
      } else {
        counter?.inc()
      }

      this.logger.debug(`Incremented counter: ${name}`)
    } catch (error) {
      this.logger.error(`Error incrementing counter: ${error}`)
    }
  }

  setGauge(
    name: string,
    value: number,
    labels: Record<string, string> = {}
  ): void {
    this.recordCustomMetric(name, value, labels)
  }

  recordApplicationStartTime(): void {
    try {
      const startTimeSeconds = Date.now() / 1000
      this.applicationStartTime.set(startTimeSeconds)
      this.logger.log(
        `Application start time recorded: ${new Date().toISOString()}`
      )
    } catch (error) {
      this.logger.error(`Error recording application start time: ${error}`)
    }
  }

  recordDatabaseConnectionStatus(status: 'connected' | 'disconnected'): void {
    try {
      const statusValue = status === 'connected' ? 1 : 0
      this.databaseConnectionStatus.labels('connvertpay-db').set(statusValue)
      this.logger.debug(`Database connection status: ${status}`)
    } catch (error) {
      this.logger.error(`Error recording database connection status: ${error}`)
    }
  }

  async getMetrics(): Promise<string> {
    try {
      return await this.registry.metrics()
    } catch (error) {
      this.logger.error(`Error getting metrics: ${error}`)
      throw error
    }
  }

  getMetricsContentType(): string {
    return this.registry.contentType
  }

  resetMetrics(): void {
    try {
      this.registry.resetMetrics()
      this.customCounters.clear()
      this.customGauges.clear()
      this.logger.log('Metrics reset successfully')
    } catch (error) {
      this.logger.error(`Error resetting metrics: ${error}`)
    }
  }

  /**
   * Sanitizes URL paths to avoid high cardinality in Prometheus metrics
   * Replaces UUIDs and numeric IDs with placeholders
   */
  private sanitizePathForMetrics(path: string): string {
    // Remove query parameters
    const cleanPath = path.split('?')[0]

    // Replace UUIDs with :id placeholder
    const uuidPattern =
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
    let sanitized = cleanPath.replace(uuidPattern, '/:id')

    // Replace numeric IDs with :id placeholder
    const numericIdPattern = /\/\d+/g
    sanitized = sanitized.replace(numericIdPattern, '/:id')

    // Replace multiple consecutive :id with single :id
    sanitized = sanitized.replace(/(\/:\w+)+/g, '/:id')

    // Ensure path starts with /
    if (!sanitized.startsWith('/')) {
      sanitized = `/${sanitized}`
    }

    return sanitized
  }
}
