export enum ProductClassification {
  A = 'A', // High value, low volume
  B = 'B', // Medium value, medium volume
  C = 'C', // Low value, high volume
}

export interface IProduct {
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

export interface ICreateProduct {
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

export interface IUpdateProduct {
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

export interface IStockAdjustment {
  productId: string;
  quantity: number;
  reason: string;
  type: 'IN' | 'OUT';
  reference?: string;
}
