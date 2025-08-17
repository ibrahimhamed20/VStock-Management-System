import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { IClient, ITransaction } from '../interfaces/client.interface';
import { Invoice } from 'src/sales/entities/invoice.entity';

@Entity('clients')
export class Client implements IClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'simple-array', default: [] })
  tags: string[];

  @Column({ type: 'json', default: [] })
  transactions: ITransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Invoice, (invoice: Invoice) => invoice.client)
  invoices: Invoice[];
}
