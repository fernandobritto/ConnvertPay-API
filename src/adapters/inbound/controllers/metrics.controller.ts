import { Controller, Get, Header, Inject, Logger } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import {
  IMetricsProvider,
  METRICS_PROVIDER
} from 'src/ports/outbound/providers/metrics/metrics.interface'

@ApiExcludeController() // Exclude from Swagger documentation
@Controller()
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name)

  constructor(
    @Inject(METRICS_PROVIDER)
    private readonly metricsProvider: IMetricsProvider
  ) {}

  @Get('metrics')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async getMetrics(): Promise<string> {
    try {
      this.logger.debug('Metrics endpoint accessed')

      const metrics = await this.metricsProvider.getMetrics()

      // Set content type header manually since NestJS doesn't handle it well for text/plain
      const response = metrics

      this.logger.debug(`Returned ${response.length} bytes of metrics data`)
      return response
    } catch (error) {
      this.logger.error(`Error retrieving metrics: ${error}`)
      throw error
    }
  }

  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      metrics_provider: 'prometheus'
    }
  }
}
