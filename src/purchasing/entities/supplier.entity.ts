import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Purchase } from './purchase.entity';

@Entity('suppliers')
@Index(['name'], { unique: true })
@Index(['email'])
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 255 })
  contactPerson: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxId: string;

  @Column({ type: 'int', default: 30 })
  paymentTerms: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Purchase, (purchase: Purchase) => purchase.supplier, {
    cascade: true,
  })
  purchases: Purchase[];
}
