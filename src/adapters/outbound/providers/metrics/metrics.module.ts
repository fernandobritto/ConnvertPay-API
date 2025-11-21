import { Module } from '@nestjs/common'
import { PrometheusMetricsProvider } from './metrics.provider'
import { METRICS_PROVIDER } from 'src/ports/outbound/providers/metrics/metrics.interface'

@Module({
  exports: [METRICS_PROVIDER],
  providers: [
    {
      provide: METRICS_PROVIDER,
      useClass: PrometheusMetricsProvider
    }
  ]
})
export class MetricsModule {}