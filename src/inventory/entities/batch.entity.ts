import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('batches')
@Index(['batchId'], { unique: true })
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  batchId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  remainingQuantity: number;

  @Column({ type: 'date', nullable: true })
  manufacturingDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplier: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Product, (product) => product.batches)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
