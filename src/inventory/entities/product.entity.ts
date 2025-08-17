import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ProductClassification } from '../interfaces/product.interface';
import { Batch } from './batch.entity';
import { StockMovement } from './stock-movement.entity';

@Entity('products')
@Index(['sku'], { unique: true })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sellingPrice: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 0 })
  minStock: number;

  @Column({ type: 'int', default: 1000 })
  maxStock: number;

  @Column({
    type: 'enum',
    enum: ProductClassification,
    default: ProductClassification.C,
  })
  classification: ProductClassification;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplier: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Batch, (batch) => batch.product)
  batches: Batch[];

  @OneToMany(() => StockMovement, (movement) => movement.product)
  stockMovements: StockMovement[];
}
