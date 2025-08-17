import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Purchase } from './purchase.entity';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  purchaseId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'varchar', length: 255 })
  productName: string;

  @Column({ type: 'varchar', length: 50 })
  productSku: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number;

  @Column({ type: 'int', default: 0 })
  receivedQuantity: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Purchase, (purchase: Purchase) => purchase.items)
  @JoinColumn({ name: 'purchaseId' })
  purchase: Purchase;
}
