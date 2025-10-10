import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class Account1748298971984 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'account',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            default: 'uuid_generate_v4()'
          },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'number', type: 'numeric', isNullable: false },
          { name: 'description', type: 'text', isNullable: true }
        ]
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('account', true)
  }
}
