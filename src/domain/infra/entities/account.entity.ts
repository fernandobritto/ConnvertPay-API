import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('account')
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)'
  })
  updatedAt!: Date

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: false })
  number: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string
}
