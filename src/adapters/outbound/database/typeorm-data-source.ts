import { DataSource, DataSourceOptions } from 'typeorm'

let datasouce: DataSourceOptions
if (process.env.DATABASE_ENVIRONMENT === 'development') {
  datasouce = {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 5432,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: false,
    entities: ['src/domain/entities/*.entity{.ts,.js}'],
    migrations: ['src/adapters/outbound/database/migrations/*{.ts,.js}']
  }
} else {
  datasouce = {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 5432,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    logging: true,
    synchronize: false,
    entities: ['src/domain/entities/*.entity{.ts,.js}'],
    migrations: ['src/adapters/outbound/database/migrations/*{.ts,.js}'],
    ssl: { rejectUnauthorized: false }
  }
}
export default new DataSource(datasouce)
