import { useQuery } from '@tanstack/react-query';
import { purchasingService } from '../services';

export const usePurchasingStats = () => {
  return useQuery({
    queryKey: ['purchasing', 'stats'],
    queryFn: async () => {
      const dashboardData = await purchasingService.getDashboardStats();
      return dashboardData.stats;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

