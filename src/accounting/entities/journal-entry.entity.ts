import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './account.entity';

@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => JournalEntryLine, (line) => line.journalEntry, {
    cascade: true,
    eager: true,
  })
  lines: JournalEntryLine[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('journal_entry_lines')
export class JournalEntryLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['debit', 'credit'] })
  type: 'debit' | 'credit';

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @ManyToOne(() => JournalEntry, (entry) => entry.lines)
  @JoinColumn({ name: 'journalEntryId' })
  journalEntry: JournalEntry;

  @ManyToOne(() => Account, (account) => account.journalEntryLines)
  @JoinColumn({ name: 'accountId' })
  account: Account;


}
