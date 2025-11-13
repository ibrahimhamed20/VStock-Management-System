import apiService from '../../core/services/api';
import type { Settings, UpdateSettingsData } from '../types';

class SettingsService {
  async getSettings(): Promise<Settings> {
    return await apiService.get<Settings>('/settings');
  }

  async updateSettings(data: UpdateSettingsData): Promise<Settings> {
    return await apiService.patch<Settings>('/settings', data);
  }
}

export const settingsService = new SettingsService();

