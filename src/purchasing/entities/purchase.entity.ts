import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import {
  PurchaseStatus,
  PaymentStatus,
} from '../interfaces/purchase.interface';
import { PurchaseItem } from './purchase-item.entity';
import { Supplier } from './supplier.entity';

@Entity('purchases')
@Index(['purchaseNumber'], { unique: true })
@Index(['supplierId', 'orderDate'])
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  purchaseNumber: string;

  @Column({ type: 'uuid' })
  supplierId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  remainingAmount: number;

  @Column({
    type: 'enum',
    enum: PurchaseStatus,
    default: PurchaseStatus.DRAFT,
  })
  purchaseStatus: PurchaseStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'date' })
  orderDate: Date;

  @Column({ type: 'date' })
  expectedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  actualDeliveryDate: Date;

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

  @ManyToOne(() => Supplier, (supplier: Supplier) => supplier.purchases)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @OneToMany(() => PurchaseItem, (item: PurchaseItem) => item.purchase, { cascade: true })
  items: PurchaseItem[];
}
