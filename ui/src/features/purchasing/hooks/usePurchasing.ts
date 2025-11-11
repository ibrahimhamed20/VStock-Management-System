import { useQuery } from '@tanstack/react-query';
import { purchasingService } from '../services';
import type {
  PurchaseFilters,
  PurchaseSearchParams,
  PurchaseStatus,
} from '../types';

// Purchase Hooks
export const usePurchases = (filters?: PurchaseFilters) => {
  return useQuery({
    queryKey: ['purchases', filters],
    queryFn: () => purchasingService.getPurchases(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePurchaseById = (id: string) => {
  return useQuery({
    queryKey: ['purchase', id],
    queryFn: () => purchasingService.getPurchaseById(id),
    enabled: !!id,
  });
};

export const usePurchaseByNumber = (purchaseNumber: string) => {
  return useQuery({
    queryKey: ['purchase', 'number', purchaseNumber],
    queryFn: () => purchasingService.getPurchaseByNumber(purchaseNumber),
    enabled: !!purchaseNumber,
  });
};

export const usePurchasesBySupplier = (supplierId: string) => {
  return useQuery({
    queryKey: ['purchases', 'supplier', supplierId],
    queryFn: () => purchasingService.getPurchasesBySupplier(supplierId),
    enabled: !!supplierId,
  });
};

export const usePurchasesByStatus = (status: PurchaseStatus) => {
  return useQuery({
    queryKey: ['purchases', 'status', status],
    queryFn: () => purchasingService.getPurchasesByStatus(status),
    enabled: !!status,
  });
};

export const useOverduePurchases = () => {
  return useQuery({
    queryKey: ['purchases', 'overdue'],
    queryFn: () => purchasingService.getOverduePurchases(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSearchPurchases = (params: PurchaseSearchParams) => {
  return useQuery({
    queryKey: ['purchases', 'search', params],
    queryFn: () => purchasingService.searchPurchases(params),
    enabled: !!(params.supplierId || params.status || params.startDate || params.endDate || params.search),
  });
};

// Supplier Hooks
export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => purchasingService.getSuppliers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSupplierById = (id: string) => {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => purchasingService.getSupplierById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Reports and Analytics Hooks
export const usePurchaseReport = (filters?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['purchasing', 'report', filters],
    queryFn: () => purchasingService.getPurchaseReport(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['purchasing', 'dashboard'],
    queryFn: () => purchasingService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on 401/403 errors
      const errorResponse = (error as { response?: { status?: number } })?.response;
      if (errorResponse?.status === 401 || errorResponse?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useTopSuppliers = (limit: number = 10) => {
  return useQuery({
    queryKey: ['purchasing', 'top-suppliers', limit],
    queryFn: () => purchasingService.getTopSuppliers(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on 401/403 errors
      const errorResponse = (error as { response?: { status?: number } })?.response;
      if (errorResponse?.status === 401 || errorResponse?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const usePurchaseTrend = (months: number = 12) => {
  return useQuery({
    queryKey: ['purchasing', 'trend', months],
    queryFn: () => purchasingService.getPurchaseTrend(months),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on 401/403 errors
      const errorResponse = (error as { response?: { status?: number } })?.response;
      if (errorResponse?.status === 401 || errorResponse?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useSupplierPerformance = () => {
  return useQuery({
    queryKey: ['purchasing', 'supplier-performance'],
    queryFn: () => purchasingService.getSupplierPerformance(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on 401/403 errors
      const errorResponse = (error as { response?: { status?: number } })?.response;
      if (errorResponse?.status === 401 || errorResponse?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Product Hooks
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => purchasingService.getProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => purchasingService.getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActiveProducts = () => {
  return useQuery({
    queryKey: ['products', 'active'],
    queryFn: () => purchasingService.getActiveProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Utility Hooks
export const useNextPurchaseNumber = () => {
  return useQuery({
    queryKey: ['purchasing', 'next-purchase-number'],
    queryFn: () => purchasingService.getNextPurchaseNumber(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

