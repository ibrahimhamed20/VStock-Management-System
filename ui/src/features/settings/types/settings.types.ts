export interface Settings {
  id: string;
  // Basic Settings
  currency: string;
  language: string;
  fiscalYear: string | null;
  taxRate: number;
  // Company Information
  companyName: string | null;
  companyAddress: string | null;
  companyPhone: string | null;
  companyEmail: string | null;
  companyTaxId: string | null;
  // Invoice Settings
  invoicePrefix: string;
  defaultPaymentTerms: number;
  invoiceFooter: string | null;
  // Date/Time Settings
  timezone: string;
  dateFormat: string;
  // Inventory Settings
  lowStockThreshold: number;
  autoReorderEnabled: boolean;
  defaultUnit: string | null;
  // Email/SMTP Settings
  smtpHost: string | null;
  smtpPort: number | null;
  smtpSecure: boolean;
  smtpUsername: string | null;
  smtpPassword: string | null;
  emailFrom: string | null;
  emailFromName: string | null;
  // Print/Export Settings
  defaultPaperSize: string | null;
  logoUrl: string | null;
  printHeader: string | null;
  printFooter: string | null;
  // Number Format Settings
  decimalSeparator: string | null;
  thousandSeparator: string | null;
  decimalPlaces: number;
  // Security Settings
  sessionTimeout: number;
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  maxLoginAttempts: number;
  // Notification Settings
  emailNotificationsEnabled: boolean;
  lowStockAlertsEnabled: boolean;
  overdueInvoiceAlertsEnabled: boolean;
  alertEmailRecipients: string | null;
  // Backup Settings
  autoBackupEnabled: boolean;
  backupFrequency: string | null;
  backupRetentionDays: number;
  // Business Hours Settings
  businessDays: string | null;
  openingTime: string | null;
  closingTime: string | null;
}

export interface UpdateSettingsData {
  // Basic Settings
  currency?: string;
  language?: string;
  fiscalYear?: string;
  taxRate?: number;
  // Company Information
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyTaxId?: string;
  // Invoice Settings
  invoicePrefix?: string;
  defaultPaymentTerms?: number;
  invoiceFooter?: string;
  // Date/Time Settings
  timezone?: string;
  dateFormat?: string;
  // Inventory Settings
  lowStockThreshold?: number;
  autoReorderEnabled?: boolean;
  defaultUnit?: string;
  // Email/SMTP Settings
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
  emailFrom?: string;
  emailFromName?: string;
  // Print/Export Settings
  defaultPaperSize?: string;
  logoUrl?: string;
  printHeader?: string;
  printFooter?: string;
  // Number Format Settings
  decimalSeparator?: string;
  thousandSeparator?: string;
  decimalPlaces?: number;
  // Security Settings
  sessionTimeout?: number;
  passwordMinLength?: number;
  passwordRequireSpecialChars?: boolean;
  maxLoginAttempts?: number;
  // Notification Settings
  emailNotificationsEnabled?: boolean;
  lowStockAlertsEnabled?: boolean;
  overdueInvoiceAlertsEnabled?: boolean;
  alertEmailRecipients?: string;
  // Backup Settings
  autoBackupEnabled?: boolean;
  backupFrequency?: string;
  backupRetentionDays?: number;
  // Business Hours Settings
  businessDays?: string;
  openingTime?: string;
  closingTime?: string;
}
