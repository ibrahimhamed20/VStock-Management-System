import { IsString, IsOptional, IsNumber, Min, Max, IsEmail, MaxLength, Matches, IsBoolean, IsIn } from 'class-validator';

export class UpdateSettingsDto {
  // Basic Settings
  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  fiscalYear?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  taxRate?: number;

  // Company Information
  @IsString()
  @IsOptional()
  @MaxLength(255)
  companyName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  companyAddress?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  companyPhone?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  companyEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  companyTaxId?: string;

  // Invoice Settings
  @IsString()
  @IsOptional()
  @MaxLength(10)
  @Matches(/^[A-Z0-9]+$/, { message: 'Invoice prefix must contain only uppercase letters and numbers' })
  invoicePrefix?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(365)
  defaultPaymentTerms?: number;

  @IsString()
  @IsOptional()
  invoiceFooter?: string;

  // Date/Time Settings
  @IsString()
  @IsOptional()
  @MaxLength(50)
  timezone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  dateFormat?: string;

  // Inventory Settings
  @IsNumber()
  @IsOptional()
  @Min(0)
  lowStockThreshold?: number;

  @IsBoolean()
  @IsOptional()
  autoReorderEnabled?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  defaultUnit?: string;

  // Email/SMTP Settings
  @IsString()
  @IsOptional()
  @MaxLength(255)
  smtpHost?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(65535)
  smtpPort?: number;

  @IsBoolean()
  @IsOptional()
  smtpSecure?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  smtpUsername?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  smtpPassword?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  emailFrom?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  emailFromName?: string;

  // Print/Export Settings
  @IsString()
  @IsOptional()
  @IsIn(['A4', 'A3', 'Letter', 'Legal'])
  defaultPaperSize?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  logoUrl?: string;

  @IsString()
  @IsOptional()
  printHeader?: string;

  @IsString()
  @IsOptional()
  printFooter?: string;

  // Number Format Settings
  @IsString()
  @IsOptional()
  @MaxLength(1)
  decimalSeparator?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1)
  thousandSeparator?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(6)
  decimalPlaces?: number;

  // Security Settings
  @IsNumber()
  @IsOptional()
  @Min(5)
  @Max(1440)
  sessionTimeout?: number;

  @IsNumber()
  @IsOptional()
  @Min(4)
  @Max(32)
  passwordMinLength?: number;

  @IsBoolean()
  @IsOptional()
  passwordRequireSpecialChars?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(3)
  @Max(10)
  maxLoginAttempts?: number;

  // Notification Settings
  @IsBoolean()
  @IsOptional()
  emailNotificationsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  lowStockAlertsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  overdueInvoiceAlertsEnabled?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  alertEmailRecipients?: string;

  // Backup Settings
  @IsBoolean()
  @IsOptional()
  autoBackupEnabled?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly'])
  backupFrequency?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(365)
  backupRetentionDays?: number;

  // Business Hours Settings
  @IsString()
  @IsOptional()
  @MaxLength(100)
  businessDays?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Time must be in HH:MM format' })
  openingTime?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Time must be in HH:MM format' })
  closingTime?: string;
}
