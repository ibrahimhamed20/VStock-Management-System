// Inventory types that match the backend interfaces

export enum ProductClassification {
  A = 'A', // High value, low volume
  B = 'B', // Medium value, medium volume
  C = 'C', // Low value, high volume
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unitCost: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  maxStock: number;
  classification: ProductClassification;
  category?: string;
  supplier?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductData {
  sku: string;
  name: string;
  description?: string;
  unitCost: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  maxStock: number;
  category?: string;
  supplier?: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  unitCost?: number;
  sellingPrice?: number;
  minStock?: number;
  maxStock?: number;
  category?: string;
  supplier?: string;
  isActive?: boolean;
}

export interface StockAdjustment {
  productId: string;
  quantity: number;
  reason: string;
  type: 'IN' | 'OUT';
  reference?: string;
}

export interface Batch {
  id: string;
  batchId: string;
  productId: string;
  expiryDate: Date;
  quantity: number;
  remainingQuantity: number;
  manufacturingDate?: Date;
  supplier?: string;
  cost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBatchData {
  batchId: string;
  productId: string;
  expiryDate: Date;
  quantity: number;
  manufacturingDate?: Date;
  supplier?: string;
  cost: number;
}

export interface UpdateBatchData {
  expiryDate?: Date;
  manufacturingDate?: Date;
  supplier?: string;
  cost?: number;
}

export interface BatchExpiry {
  batchId: string;
  productName: string;
  expiryDate: Date;
  remainingQuantity: number;
  daysUntilExpiry: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  reference?: string;
  userId: string;
  username: string;
  createdAt: Date;
}

export interface InventoryStats {
  totalProducts: number;
  totalStockValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  expiringBatches: number;
  totalCategories: number;
  totalSuppliers: number;
}

export interface StockValueReport {
  totalProducts: number;
  totalValue: number;
  categoryBreakdown: Record<string, { count: number; value: number }>;
  averageValue: number;
}

export interface StockAlerts {
  lowStockCount: number;
  lowStockProducts: Array<{
    id: string;
    sku: string;
    name: string;
    currentStock: number;
    minStock: number;
    deficit: number;
  }>;
  expiringCount: number;
  expiringBatches: Array<{
    batchId: string;
    productName: string;
    expiryDate: Date;
    remainingQuantity: number;
    daysUntilExpiry: number;
  }>;
}

export interface ABCClassification {
  classification: ProductClassification;
  products: Product[];
  totalValue: number;
  percentage: number;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  classification?: ProductClassification;
  supplier?: string;
  isActive?: boolean;
  lowStock?: boolean;
}

export interface ProductSearchParams {
  q?: string;
  category?: string;
  classification?: ProductClassification;
  supplier?: string;
}
