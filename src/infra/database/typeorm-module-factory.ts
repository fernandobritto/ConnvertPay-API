import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import type {
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory
} from '@nestjs/typeorm'

@Injectable()
export class TypeOrmModuleFactory implements TypeOrmOptionsFactory {
  constructor(private config: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const config: TypeOrmModuleOptions = {
      type: 'postgres',
      host: this.config.get<string>('DATABASE_HOST'),
      port: Number(this.config.get<string>('DATABASE_PORT')) || 5432,
      username: this.config.get<string>('DATABASE_USERNAME'),
      password: this.config.get<string>('DATABASE_PASSWORD'),
      database: this.config.get<string>('DATABASE_NAME'),
      synchronize: false,
      entities: ['src/domain/infra/entities/*.entity.{js, ts}'],
      migrations: ['src/infra/database/migrations/*.{js, ts}'],
      migrationsRun: true,
      autoLoadEntities: true
    }

    if (this.config.get<string>('DATABASE_ENVIRONMENT') === 'development') {
      return config
    }

    return {
      ...config,
      ssl: { rejectUnauthorized: false }
    }
  }
}
