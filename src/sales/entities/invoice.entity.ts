import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { PaymentStatus } from '../interfaces/invoice.interface';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from './payment.entity';
import { Client } from 'src/clients/entities/client.entity';

@Entity('invoices')
@Index(['invoiceNumber'], { unique: true })
@Index(['clientId', 'issueDate'])
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  invoiceNumber: string;

  @Column({ type: 'uuid' })
  clientId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  remainingAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'varchar', length: 100 })
  createdByName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => InvoiceItem, (item: InvoiceItem) => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @OneToMany(() => Payment, (payment: Payment) => payment.invoice, { cascade: true })
  payments: Payment[];

  @ManyToOne(() => Client, (client: Client) => client.invoices)
  @JoinColumn({ name: 'clientId' })
  client: Client;
}
