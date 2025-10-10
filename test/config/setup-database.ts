import { randomUUID } from 'crypto'
import dotenv from 'dotenv'
import { newDb } from 'pg-mem'
import { DataSource } from 'typeorm'

dotenv.config()

const { env } = process

export async function setupDatabase(): Promise<DataSource> {
  const db = newDb()

  db.public.registerFunction({
    name: 'uuid_generate_v4',
    implementation: () => randomUUID()
  })

  const dataSource = (await db.adapters.createTypeormDataSource({
    type: 'postgres',
    entities: ['src/domain/infra/entities/*.entity{.ts,.js}'],
    synchronize: true
  })) as DataSource

  await dataSource.createQueryRunner().createDatabase(env.DATABASE_NAME!, true)
  return dataSource
}
