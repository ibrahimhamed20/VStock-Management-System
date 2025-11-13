import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { settingsService } from '../services';
import type { UpdateSettingsData } from '../types';
import type { AxiosError } from 'axios';

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingsData) => settingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      message.success('Settings updated successfully');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      message.error(error?.response?.data?.message || 'Failed to update settings');
    },
  });
};

