export enum PurchaseStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ORDERED = 'ORDERED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export interface IPurchaseItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity: number;
  notes?: string;
}

export interface IPurchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  supplierAddress: string;
  supplierPaymentTerms: string;
  items: IPurchaseItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  purchaseStatus: PurchaseStatus;
  paymentStatus: PaymentStatus;
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePurchase {
  supplierId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
    notes?: string;
  }>;
  taxRate?: number;
  shippingCost?: number;
  expectedDeliveryDate?: Date;
  notes?: string;
}

export interface IUpdatePurchase {
  items?: Array<{
    productId: string;
    productName?: string;
    productSku?: string;
    quantity: number;
    unitCost: number;
    notes?: string;
  }>;
  taxRate?: number;
  shippingCost?: number;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  purchaseStatus?: PurchaseStatus;
  paymentStatus?: PaymentStatus;
}

export interface ISupplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  taxId?: string;
  paymentTerms: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateSupplier {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  taxId?: string;
  paymentTerms?: number;
}

export interface IUpdateSupplier {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  taxId?: string;
  paymentTerms?: number;
  isActive?: boolean;
}

export interface IPurchaseReport {
  totalPurchases: number;
  totalAmount: number;
  pendingPurchases: number;
  receivedPurchases: number;
  averagePurchaseValue: number;
  topSuppliers: Array<{
    supplierId: string;
    supplierName: string;
    purchases: number;
    totalAmount: number;
  }>;
  purchasesByPeriod: Array<{
    period: string;
    purchases: number;
    amount: number;
  }>;
}
