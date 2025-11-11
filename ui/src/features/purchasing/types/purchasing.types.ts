// Purchasing Types and Interfaces
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

export interface PurchaseItem {
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

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  supplierAddress: string;
  supplierPaymentTerms: string;
  items: PurchaseItem[];
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

export interface CreatePurchaseData {
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

export interface UpdatePurchaseData {
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

export interface ReceivePurchaseData {
  receivedItems: Array<{
    itemId: string;
    receivedQuantity: number;
  }>;
}

export interface Supplier {
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

export interface CreateSupplierData {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  taxId?: string;
  paymentTerms?: number;
}

export interface UpdateSupplierData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  taxId?: string;
  paymentTerms?: number;
  isActive?: boolean;
}

export interface PurchaseReport {
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

export interface PurchasingStatistics {
  totalPurchases: number;
  totalAmount: number;
  pendingPurchases: number;
  receivedPurchases: number;
  overduePurchases: number;
  overdueAmount: number;
  averagePurchaseValue: number;
  monthlyPurchases: number;
  weeklyPurchases: number;
  dailyPurchases: number;
}

export interface TopSupplier {
  supplierId: string;
  supplierName: string;
  purchases: number;
  totalAmount: number;
  percentage: number;
}

export interface PurchaseTrend {
  period: string;
  purchases: number;
  amount: number;
  growth: number;
}

export interface SupplierPerformance {
  supplierId: string;
  supplierName: string;
  purchases: number;
  totalAmount: number;
  averageAmount: number;
  lastPurchase: Date;
  onTimeDeliveryRate: number;
}

export interface PurchaseFilters {
  supplierId?: string;
  status?: PurchaseStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PurchaseSearchParams {
  supplierId?: string;
  status?: PurchaseStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface PurchasingDashboardData {
  stats: PurchasingStatistics;
  recentPurchases: Purchase[];
  topSuppliers: TopSupplier[];
  purchaseTrend: PurchaseTrend[];
  overduePurchases: Purchase[];
  supplierPerformance: SupplierPerformance[];
}

// Product interface for purchasing context
export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  active: boolean;
}

