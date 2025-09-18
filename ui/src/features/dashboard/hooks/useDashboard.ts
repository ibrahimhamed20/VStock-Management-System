import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '../services/dashboardService';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: DashboardService.getDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 60000, // Consider data stale after 1 minute
  });
};

export const useSystemStatus = () => {
  return useQuery({
    queryKey: ['system-status'],
    queryFn: DashboardService.getSystemStatus,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
};

export const useRecentOrders = () => {
  return useQuery({
    queryKey: ['recent-orders'],
    queryFn: DashboardService.getRecentOrders,
    refetchInterval: 45000, // Refetch every 45 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
  });
};

export const useTopProducts = () => {
  return useQuery({
    queryKey: ['top-products'],
    queryFn: DashboardService.getTopProducts,
    refetchInterval: 120000, // Refetch every 2 minutes
    staleTime: 300000, // Consider data stale after 5 minutes
  });
};

export const useLowStockProducts = () => {
  return useQuery({
    queryKey: ['low-stock-products'],
    queryFn: DashboardService.getLowStockProducts,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
};

export const usePendingInvoices = () => {
  return useQuery({
    queryKey: ['pending-invoices'],
    queryFn: DashboardService.getPendingInvoices,
    refetchInterval: 45000, // Refetch every 45 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
  });
};

export const useFinancialSummary = () => {
  return useQuery({
    queryKey: ['financial-summary'],
    queryFn: DashboardService.getFinancialSummary,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 600000, // Consider data stale after 10 minutes
  });
};

// Combined hook for all dashboard data
export const useDashboardData = () => {
  const stats = useDashboardStats();
  const systemStatus = useSystemStatus();
  const recentOrders = useRecentOrders();
  const topProducts = useTopProducts();
  const lowStockProducts = useLowStockProducts();
  const pendingInvoices = usePendingInvoices();
  const financialSummary = useFinancialSummary();

  const isLoading = stats.isLoading || systemStatus.isLoading || recentOrders.isLoading || 
                   topProducts.isLoading || lowStockProducts.isLoading || 
                   pendingInvoices.isLoading || financialSummary.isLoading;

  const hasError = stats.error || systemStatus.error || recentOrders.error || 
                  topProducts.error || lowStockProducts.error || 
                  pendingInvoices.error || financialSummary.error;

  return {
    stats: stats.data,
    systemStatus: systemStatus.data,
    recentOrders: recentOrders.data || [],
    topProducts: topProducts.data || [],
    lowStockProducts: lowStockProducts.data || [],
    pendingInvoices: pendingInvoices.data || [],
    financialSummary: financialSummary.data,
    isLoading,
    hasError,
    refetch: () => {
      stats.refetch();
      systemStatus.refetch();
      recentOrders.refetch();
      topProducts.refetch();
      lowStockProducts.refetch();
      pendingInvoices.refetch();
      financialSummary.refetch();
    }
  };
};

