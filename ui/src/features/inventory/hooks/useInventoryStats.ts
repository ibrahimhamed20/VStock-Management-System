import { useMemo } from 'react';
import { useProducts, useStockAlerts } from './useInventory';
import type { InventoryStats } from '../types/inventory.types';

export const useInventoryStats = (): { stats: InventoryStats; isLoading: boolean; error: any } => {
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts();
  const { data: stockAlerts, isLoading: alertsLoading, error: alertsError } = useStockAlerts();

  const stats = useMemo((): InventoryStats => {
    if (!products) {
      return {
        totalProducts: 0,
        totalStockValue: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        expiringBatches: 0,
        totalCategories: 0,
        totalSuppliers: 0,
      };
    }

    const totalStockValue = products.reduce((sum, product) => sum + (product.unitCost * product.stock), 0);
    const lowStockProducts = products.filter(product => product.stock <= product.minStock).length;
    const outOfStockProducts = products.filter(product => product.stock === 0).length;
    
    // Get unique categories and suppliers
    const categories = new Set(products.map(p => p.category).filter(Boolean));
    const suppliers = new Set(products.map(p => p.supplier).filter(Boolean));

    return {
      totalProducts: products.length,
      totalStockValue,
      lowStockProducts,
      outOfStockProducts,
      expiringBatches: stockAlerts?.expiringCount || 0,
      totalCategories: categories.size,
      totalSuppliers: suppliers.size,
    };
  }, [products, stockAlerts]);

  return { 
    stats, 
    isLoading: productsLoading || alertsLoading, 
    error: productsError || alertsError 
  };
};
