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

  @Column()
  userId!: string;

  @Column()
  fileName!: string;

  @Column()
  filePath!: string;

  @Column({
    type: 'enum',
    enum: ExpiryType,
    default: ExpiryType.SEVEN_DAYS
  })
  expiryType!: ExpiryType;

  @Column({ nullable: true })
  expiresAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: false })
  isDeleted!: boolean;
} 