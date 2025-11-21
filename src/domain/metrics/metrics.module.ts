import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { MetricsModule as MetricsProviderModule } from 'src/adapters/outbound/providers/metrics/metrics.module'
import { MetricsInterceptor } from 'src/adapters/inbound/interceptors/metrics.interceptor'
import { MetricsController } from 'src/adapters/inbound/controllers/metrics.controller'
import { MetricsService } from './metrics.service'

@Module({
  imports: [MetricsProviderModule],
  controllers: [MetricsController],
  providers: [
    MetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor
    }
  ],
  exports: [MetricsProviderModule, MetricsService]
})
export class ApplicationMetricsModule {}