import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './entities/settings.entity';
import { UpdateSettingsDto } from './dtos/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepo: Repository<Settings>,
  ) { }

  async getSettings() {
    // Get the first settings record, or create one if none exists
    const allSettings = await this.settingsRepo.find({
      order: { id: 'ASC' },
      take: 1,
    });
    
    let settings = allSettings.length > 0 ? allSettings[0] : null;
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = this.settingsRepo.create({
        currency: 'USD',
        language: 'en',
        invoicePrefix: 'INV',
        defaultPaymentTerms: 30,
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        lowStockThreshold: 10,
        autoReorderEnabled: false,
        defaultUnit: 'pcs',
        smtpSecure: false,
        defaultPaperSize: 'A4',
        decimalSeparator: '.',
        thousandSeparator: ',',
        decimalPlaces: 2,
        sessionTimeout: 30,
        passwordMinLength: 8,
        passwordRequireSpecialChars: false,
        maxLoginAttempts: 5,
        emailNotificationsEnabled: true,
        lowStockAlertsEnabled: true,
        overdueInvoiceAlertsEnabled: true,
        autoBackupEnabled: false,
        backupFrequency: 'daily',
        backupRetentionDays: 30,
        businessDays: 'Monday,Tuesday,Wednesday,Thursday,Friday',
        openingTime: '09:00',
        closingTime: '17:00',
      });
      await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    // Get the first settings record, or create one if none exists
    const allSettings = await this.settingsRepo.find({
      order: { id: 'ASC' },
      take: 1,
    });
    
    let settings = allSettings.length > 0 ? allSettings[0] : null;
    
    if (!settings) {
      settings = this.settingsRepo.create({
        currency: 'USD',
        language: 'en',
        invoicePrefix: 'INV',
        defaultPaymentTerms: 30,
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        lowStockThreshold: 10,
        autoReorderEnabled: false,
        defaultUnit: 'pcs',
        smtpSecure: false,
        defaultPaperSize: 'A4',
        decimalSeparator: '.',
        thousandSeparator: ',',
        decimalPlaces: 2,
        sessionTimeout: 30,
        passwordMinLength: 8,
        passwordRequireSpecialChars: false,
        maxLoginAttempts: 5,
        emailNotificationsEnabled: true,
        lowStockAlertsEnabled: true,
        overdueInvoiceAlertsEnabled: true,
        autoBackupEnabled: false,
        backupFrequency: 'daily',
        backupRetentionDays: 30,
        businessDays: 'Monday,Tuesday,Wednesday,Thursday,Friday',
        openingTime: '09:00',
        closingTime: '17:00',
      });
    }
    
    Object.assign(settings, dto);
    return this.settingsRepo.save(settings);
  }
}
