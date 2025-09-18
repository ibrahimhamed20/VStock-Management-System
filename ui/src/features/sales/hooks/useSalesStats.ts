import { useQuery } from '@tanstack/react-query';
import { salesService } from '../services';

export const useSalesStats = () => {
  return useQuery({
    queryKey: ['sales', 'stats'],
    queryFn: async () => {
      const dashboardData = await salesService.getDashboardStats();
      return dashboardData.stats;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
