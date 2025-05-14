import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ExpiryType {
  ONE_DAY = '1day',
  SEVEN_DAYS = '7days',
  PERMANENT = 'permanent'
}

@Entity()
export class Share {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  userId!: string;

  @Column({ type: 'varchar' })
  fileName!: string;

  @Column({ type: 'varchar' })
  filePath!: string;

  @Column({
    type: 'enum',
    enum: ExpiryType,
    default: ExpiryType.SEVEN_DAYS
  })
  expiryType!: ExpiryType;

  @Column({ type: 'datetime', nullable: true })
  expiresAt!: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;
} 