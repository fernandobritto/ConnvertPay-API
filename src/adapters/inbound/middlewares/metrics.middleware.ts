import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { 
  IMetricsProvider, 
  METRICS_PROVIDER 
} from 'src/ports/outbound/providers/metrics/metrics.interface'

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(MetricsMiddleware.name)

  constructor(
    @Inject(METRICS_PROVIDER)
    private readonly metricsProvider: IMetricsProvider
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // Only handle metrics endpoint
    if (req.path === '/metrics') {
      this.logger.debug('Setting content-type for metrics endpoint')
      
      // Set the correct content type for Prometheus metrics
      res.setHeader('Content-Type', this.metricsProvider.getMetricsContentType())
      
      // Disable caching for metrics
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')
    }
    
    next()
  }
}