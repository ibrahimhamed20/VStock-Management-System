import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryService } from '../services/inventoryService';
import type { 
  CreateProductData, 
  UpdateProductData, 
  StockAdjustment,
  CreateBatchData,
} from '../types/inventory.types';

export const useInventoryOperations = () => {
  const queryClient = useQueryClient();

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: (productData: CreateProductData) => InventoryService.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'suppliers'] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, productData }: { id: string; productData: UpdateProductData }) => 
      InventoryService.updateProduct(id, productData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'product', id] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'low-stock'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => InventoryService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'suppliers'] });
    },
  });

  // Stock mutations
  const adjustStockMutation = useMutation({
    mutationFn: (stockAdjustment: StockAdjustment) => InventoryService.adjustStock(stockAdjustment),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'product', productId] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'reports'] });
    },
  });

  // Batch mutations
  const createBatchMutation = useMutation({
    mutationFn: (batchData: CreateBatchData) => InventoryService.createBatch(batchData),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'batches', 'product', productId] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'expiring-batches'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'reports', 'stock-alerts'] });
    },
  });

  return {
    // Product operations
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    isCreatingProduct: createProductMutation.isPending,
    isUpdatingProduct: updateProductMutation.isPending,
    isDeletingProduct: deleteProductMutation.isPending,

    // Stock operations
    adjustStock: adjustStockMutation.mutateAsync,
    isAdjustingStock: adjustStockMutation.isPending,

    // Batch operations
    createBatch: createBatchMutation.mutateAsync,
    isCreatingBatch: createBatchMutation.isPending,
  };
};

export const useInventoryOperationsById = (id: string) => {
  const queryClient = useQueryClient();

  const updateProductMutation = useMutation({
    mutationFn: (productData: UpdateProductData) => InventoryService.updateProduct(id, productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'product', id] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'low-stock'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: () => InventoryService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'suppliers'] });
    },
  });

  const adjustStockMutation = useMutation({
    mutationFn: (stockAdjustment: Omit<StockAdjustment, 'productId'>) => 
      InventoryService.adjustStock({ ...stockAdjustment, productId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'product', id] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'reports'] });
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: (batchData: Omit<CreateBatchData, 'productId'>) => 
      InventoryService.createBatch({ ...batchData, productId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'batches', 'product', id] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'expiring-batches'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'reports', 'stock-alerts'] });
    },
  });

  return {
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    adjustStock: adjustStockMutation.mutateAsync,
    createBatch: createBatchMutation.mutateAsync,
    isUpdatingProduct: updateProductMutation.isPending,
    isDeletingProduct: deleteProductMutation.isPending,
    isAdjustingStock: adjustStockMutation.isPending,
    isCreatingBatch: createBatchMutation.isPending,
  };
};
