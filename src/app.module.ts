import { Module, MiddlewareConsumer } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeOrmModuleFactory } from './infra/database/typeorm-module-factory'
import { LoggerMiddleware } from './middlewares/logger.middleware'
import { DateModule } from './infra/providers/date/date.module'
import { UtilsProviderModule } from './infra/providers/utils/utils.module'
import { exceptionHandlerProvider } from './middlewares/exception-filter.middleware'
import { AccountModule } from './app/account/account.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmModuleFactory
    }),
    DateModule,
    UtilsProviderModule,
    AccountModule
  ],
  controllers: [],
  providers: [exceptionHandlerProvider]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
