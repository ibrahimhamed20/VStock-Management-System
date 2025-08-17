import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  fiscalYear: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;
}
