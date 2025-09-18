// Inventory Management Module Exports
export { InventoryManagement } from './InventoryManagement';

// Pages
export * from './pages';

// Components
export { InventoryStats } from './components/InventoryStats';
export { LowStockAlert } from './components/LowStockAlert';
export { ExpiringBatchesAlert } from './components/ExpiringBatchesAlert';
export { ProductModal } from './components/ProductModal';
export { StockAdjustmentModal } from './components/StockAdjustmentModal';
export { StockMovementsTable } from './components/StockMovementsTable';
export { StockManagement } from './components/StockManagement';
export { BatchModal } from './components/BatchModal';
export { BatchManagement } from './components/BatchManagement';
export { InventoryReports } from './components/InventoryReports';

// Hooks
export { 
  useProducts, 
  useProductById, 
  useProductBySku, 
  useSearchProducts,
  useLowStockProducts,
  useStockMovements,
  useBatchesByProduct,
  useExpiringBatches,
  useABCClassificationReport,
  useStockValueReport,
  useStockAlerts,
  useCategories,
  useSuppliers
} from './hooks/useInventory';

export { useInventoryOperations, useInventoryOperationsById } from './hooks/useInventoryMutations';
export { useInventoryStats } from './hooks/useInventoryStats';

// Services
export { InventoryService } from './services/inventoryService';

// Types
export type { 
  Product, 
  CreateProductData, 
  UpdateProductData, 
  StockAdjustment,
  Batch,
  CreateBatchData,
  UpdateBatchData,
  BatchExpiry,
  StockMovement,
  InventoryStats,
  StockValueReport,
  StockAlerts,
  ABCClassification,
  InventoryFilters,
  ProductSearchParams,
  ProductClassification
} from './types/inventory.types';

export { ProductClassification } from './types/inventory.types';
