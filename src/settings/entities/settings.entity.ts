import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Settings
  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  fiscalYear: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  // Company Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  companyName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  companyAddress: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  companyPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyEmail: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  companyTaxId: string;

  // Invoice Settings
  @Column({ type: 'varchar', length: 10, default: 'INV' })
  invoicePrefix: string;

  @Column({ type: 'int', default: 30 })
  defaultPaymentTerms: number; // days

  @Column({ type: 'text', nullable: true })
  invoiceFooter: string;

  // Date/Time Settings
  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @Column({ type: 'varchar', length: 20, default: 'YYYY-MM-DD' })
  dateFormat: string;

  // Inventory Settings
  @Column({ type: 'int', default: 10 })
  lowStockThreshold: number;

  @Column({ type: 'boolean', default: false })
  autoReorderEnabled: boolean;

  @Column({ type: 'varchar', length: 20, default: 'pcs', nullable: true })
  defaultUnit: string;

  // Email/SMTP Settings
  @Column({ type: 'varchar', length: 255, nullable: true })
  smtpHost: string;

  @Column({ type: 'int', nullable: true })
  smtpPort: number;

  @Column({ type: 'boolean', default: false })
  smtpSecure: boolean; // Use SSL/TLS

  @Column({ type: 'varchar', length: 255, nullable: true })
  smtpUsername: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  smtpPassword: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailFrom: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailFromName: string;

  // Print/Export Settings
  @Column({ type: 'varchar', length: 20, default: 'A4', nullable: true })
  defaultPaperSize: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string;

  @Column({ type: 'text', nullable: true })
  printHeader: string;

  @Column({ type: 'text', nullable: true })
  printFooter: string;

  // Number Format Settings
  @Column({ type: 'varchar', length: 1, default: '.', nullable: true })
  decimalSeparator: string;

  @Column({ type: 'varchar', length: 1, default: ',', nullable: true })
  thousandSeparator: string;

  @Column({ type: 'int', default: 2 })
  decimalPlaces: number;

  // Security Settings
  @Column({ type: 'int', default: 30 })
  sessionTimeout: number; // minutes

  @Column({ type: 'int', default: 8 })
  passwordMinLength: number;

  @Column({ type: 'boolean', default: false })
  passwordRequireSpecialChars: boolean;

  @Column({ type: 'int', default: 5 })
  maxLoginAttempts: number;

  // Notification Settings
  @Column({ type: 'boolean', default: true })
  emailNotificationsEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  lowStockAlertsEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  overdueInvoiceAlertsEnabled: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  alertEmailRecipients: string; // comma-separated emails

  // Backup Settings
  @Column({ type: 'boolean', default: false })
  autoBackupEnabled: boolean;

  @Column({ type: 'varchar', length: 20, default: 'daily', nullable: true })
  backupFrequency: string; // daily, weekly, monthly

  @Column({ type: 'int', default: 30 })
  backupRetentionDays: number;

  // Business Hours Settings
  @Column({ type: 'varchar', length: 100, default: 'Monday,Tuesday,Wednesday,Thursday,Friday', nullable: true })
  businessDays: string; // comma-separated

  @Column({ type: 'varchar', length: 10, default: '09:00', nullable: true })
  openingTime: string;

  @Column({ type: 'varchar', length: 10, default: '17:00', nullable: true })
  closingTime: string;
}
