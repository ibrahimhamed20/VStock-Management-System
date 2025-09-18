import { useQuery } from '@tanstack/react-query';
import { salesService } from '../services';
import type {
  InvoiceFilters,
  SalesFilters,
  InvoiceSearchParams,
} from '../types';

// Invoice Hooks
export const useInvoices = (filters?: InvoiceFilters) => {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => salesService.getInvoices(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInvoiceById = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => salesService.getInvoiceById(id),
    enabled: !!id,
  });
};

export const useInvoiceByNumber = (invoiceNumber: string) => {
  return useQuery({
    queryKey: ['invoice', 'number', invoiceNumber],
    queryFn: () => salesService.getInvoiceByNumber(invoiceNumber),
    enabled: !!invoiceNumber,
  });
};

export const useInvoicesByClient = (clientId: string) => {
  return useQuery({
    queryKey: ['invoices', 'client', clientId],
    queryFn: () => salesService.getInvoicesByClient(clientId),
    enabled: !!clientId,
  });
};

export const useInvoicesByStatus = (status: string) => {
  return useQuery({
    queryKey: ['invoices', 'status', status],
    queryFn: () => salesService.getInvoicesByStatus(status),
    enabled: !!status,
  });
};

export const useOverdueInvoices = () => {
  return useQuery({
    queryKey: ['invoices', 'overdue'],
    queryFn: () => salesService.getOverdueInvoices(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSearchInvoices = (params: InvoiceSearchParams) => {
  return useQuery({
    queryKey: ['invoices', 'search', params],
    queryFn: () => salesService.searchInvoices(params),
    enabled: !!(params.clientId || params.status || params.startDate || params.endDate || params.search),
  });
};

// Payment Hooks
export const usePaymentsByInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ['payments', 'invoice', invoiceId],
    queryFn: () => salesService.getPaymentsByInvoice(invoiceId),
    enabled: !!invoiceId,
  });
};

// Reports and Analytics Hooks
export const useSalesReport = (filters?: SalesFilters) => {
  return useQuery({
    queryKey: ['sales', 'report', filters],
    queryFn: () => salesService.getSalesReport(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['sales', 'dashboard'],
    queryFn: () => salesService.getDashboardStats(),
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

export const useTopProducts = (limit: number = 10) => {
  return useQuery({
    queryKey: ['sales', 'top-products', limit],
    queryFn: () => salesService.getTopProducts(limit),
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

export const useSalesTrend = (months: number = 12) => {
  return useQuery({
    queryKey: ['sales', 'trend', months],
    queryFn: () => salesService.getSalesTrend(months),
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

export const usePaymentMethodStats = () => {
  return useQuery({
    queryKey: ['sales', 'payment-methods'],
    queryFn: () => salesService.getPaymentMethodStats(),
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

export const useClientPerformance = () => {
  return useQuery({
    queryKey: ['sales', 'client-performance'],
    queryFn: () => salesService.getClientPerformance(),
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


// Client Hooks
export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => salesService.getClients(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClientById = (id: string) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => salesService.getClientById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Product Hooks
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => salesService.getProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => salesService.getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActiveProducts = () => {
  return useQuery({
    queryKey: ['products', 'active'],
    queryFn: () => salesService.getActiveProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Utility Hooks
export const useNextInvoiceNumber = () => {
  return useQuery({
    queryKey: ['sales', 'next-invoice-number'],
    queryFn: () => salesService.getNextInvoiceNumber(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
