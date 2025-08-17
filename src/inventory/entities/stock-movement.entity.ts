import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

export enum MovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  TRANSFER = 'TRANSFER',
}

@Entity('stock_movements')
@Index(['productId', 'createdAt'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  type: MovementType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalValue: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batchId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userName: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Product, (product) => product.stockMovements)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
