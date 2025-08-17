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
    let settings = await this.settingsRepo.findOne({});
    if (!settings) {
      settings = this.settingsRepo.create();
      await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    let settings = await this.settingsRepo.findOne({});
    if (!settings) {
      settings = this.settingsRepo.create();
    }
    Object.assign(settings, dto);
    return this.settingsRepo.save(settings);
  }
}
