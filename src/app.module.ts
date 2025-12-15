import { Module, MiddlewareConsumer } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeOrmModuleFactory } from './adapters/outbound/database/typeorm-module-factory'
import { LoggerMiddleware } from './adapters/inbound/middlewares/logger.middleware'
import { MetricsMiddleware } from './adapters/inbound/middlewares/metrics.middleware'
import { DateModule } from './adapters/outbound/providers/date/date.module'
import { UtilsProviderModule } from './adapters/outbound/providers/utils/utils.module'
import { exceptionHandlerProvider } from './adapters/inbound/middlewares/exception-filter.middleware'
import { AccountModule } from './domain/account/account.module'
import { ApplicationMetricsModule } from './domain/metrics/metrics.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmModuleFactory
    }),
    DateModule,
    UtilsProviderModule,
    ApplicationMetricsModule,
    AccountModule
  ],
  controllers: [],
  providers: [exceptionHandlerProvider]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MetricsMiddleware)
      .forRoutes('metrics')
      .apply(LoggerMiddleware)
      .forRoutes('*')
  }
}
