import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PaymentMethod } from '../interfaces/invoice.interface';
import { Invoice } from './invoice.entity';

@Entity('payments')
@Index(['invoiceId', 'processedAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column({ type: 'uuid' })
  invoiceId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid' })
  processedBy: string;

  @Column({ type: 'varchar', length: 100 })
  processedByName: string;

  @Column({ type: 'timestamp' })
  processedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Invoice, (invoice) => invoice.payments)
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;
}
