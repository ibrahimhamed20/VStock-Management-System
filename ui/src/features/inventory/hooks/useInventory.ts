import { useQuery } from '@tanstack/react-query';
import { InventoryService } from '../services/inventoryService';
import type { 
  Product, 
  Batch, 
  BatchExpiry, 
  StockMovement, 
  StockValueReport, 
  StockAlerts, 
  ABCClassification,
  ProductSearchParams 
} from '../types/inventory.types';

// Product hooks
export const useProducts = () => {
  return useQuery({
    queryKey: ['inventory', 'products'],
    queryFn: () => InventoryService.getProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ['inventory', 'product', id],
    queryFn: () => InventoryService.getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductBySku = (sku: string) => {
  return useQuery({
    queryKey: ['inventory', 'product', 'sku', sku],
    queryFn: () => InventoryService.getProductBySku(sku),
    enabled: !!sku,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchProducts = (params: ProductSearchParams) => {
  return useQuery({
    queryKey: ['inventory', 'search', params],
    queryFn: () => InventoryService.searchProducts(params),
    enabled: !!(params.q || params.category || params.classification || params.supplier),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Stock hooks
export const useLowStockProducts = () => {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: () => InventoryService.getLowStockProducts(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useStockMovements = (params?: {
  productId?: string;
  type?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['inventory', 'stock-movements', params],
    queryFn: () => InventoryService.getStockMovements(params),
    staleTime: 2 * 60 * 1000,
  });
};

// Batch hooks
export const useBatchesByProduct = (productId: string) => {
  return useQuery({
    queryKey: ['inventory', 'batches', 'product', productId],
    queryFn: () => InventoryService.getBatchesByProduct(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useExpiringBatches = (days?: number) => {
  return useQuery({
    queryKey: ['inventory', 'expiring-batches', days],
    queryFn: () => InventoryService.getExpiringBatches(days),
    staleTime: 2 * 60 * 1000,
  });
};

// Report hooks
export const useABCClassificationReport = () => {
  return useQuery({
    queryKey: ['inventory', 'reports', 'abc-classification'],
    queryFn: () => InventoryService.getABCClassificationReport(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useStockValueReport = () => {
  return useQuery({
    queryKey: ['inventory', 'reports', 'stock-value'],
    queryFn: () => InventoryService.getStockValueReport(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useStockAlerts = () => {
  return useQuery({
    queryKey: ['inventory', 'reports', 'stock-alerts'],
    queryFn: () => InventoryService.getStockAlerts(),
    staleTime: 2 * 60 * 1000,
  });
};

// Utility hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ['inventory', 'categories'],
    queryFn: () => InventoryService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['inventory', 'suppliers'],
    queryFn: () => InventoryService.getSuppliers(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
