export interface IMetricsProvider {
  // HTTP Request Metrics
  recordHttpRequest(method: string, path: string, statusCode: number): void
  recordHttpRequestDuration(method: string, path: string, durationSeconds: number): void
  incrementHttpRequestsInProgress(method: string, path: string): void
  decrementHttpRequestsInProgress(method: string, path: string): void
  recordHttpException(method: string, path: string, exceptionType: string): void

  // General Application Metrics
  recordCustomMetric(name: string, value: number, labels?: Record<string, string>): void
  incrementCounter(name: string, labels?: Record<string, string>): void
  setGauge(name: string, value: number, labels?: Record<string, string>): void

  // System Health Metrics
  recordApplicationStartTime(): void
  recordDatabaseConnectionStatus(status: 'connected' | 'disconnected'): void

  // Metrics Export
  getMetrics(): Promise<string>
  getMetricsContentType(): string
  resetMetrics(): void
}

export const METRICS_PROVIDER = Symbol('METRICS_PROVIDER')