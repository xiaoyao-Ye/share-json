import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { JsonFile } from './json-file.entity';

@Entity('shares')
export class Share {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'share_code', type: 'varchar', length: 16, unique: true })
  shareCode: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'json_file_id', type: 'varchar', length: 36 })
  jsonFileId: string;

  @ManyToOne(() => JsonFile)
  @JoinColumn({ name: 'json_file_id' })
  jsonFile: JsonFile;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
