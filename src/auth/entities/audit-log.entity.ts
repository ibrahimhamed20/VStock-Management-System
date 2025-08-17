import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole } from '../interfaces/auth-payload.interface';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @Column({ type: 'simple-array' })
  userRoles: string[];

  @Column({ type: 'varchar', length: 255 })
  action: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @CreateDateColumn()
  timestamp: Date;
}
