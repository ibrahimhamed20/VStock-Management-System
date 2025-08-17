export interface IBatch {
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

export interface ICreateBatch {
  batchId: string;
  productId: string;
  expiryDate: Date;
  quantity: number;
  manufacturingDate?: Date;
  supplier?: string;
  cost: number;
}

export interface IUpdateBatch {
  expiryDate?: Date;
  manufacturingDate?: Date;
  supplier?: string;
  cost?: number;
}

export interface IBatchExpiry {
  batchId: string;
  productName: string;
  expiryDate: Date;
  remainingQuantity: number;
  daysUntilExpiry: number;
}
