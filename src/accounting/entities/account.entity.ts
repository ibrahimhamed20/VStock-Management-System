import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JournalEntryLine } from './journal-entry.entity';

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: AccountType })
  type: AccountType;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @ManyToOne(() => Account, (account) => account.children, { nullable: true })
  parent: Account;

  @OneToMany(() => Account, (account) => account.parent)
  children: Account[];

  @OneToMany(() => JournalEntryLine, (line) => line.account)
  journalEntryLines: JournalEntryLine[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
