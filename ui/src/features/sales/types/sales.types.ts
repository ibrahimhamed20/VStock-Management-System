// Sales Types and Interfaces
export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  paymentTerms: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  dueDate: Date;
  issueDate: Date;
  notes?: string;
  payments?: Payment[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceData {
  clientId: string;
  items: Array<{
    productId: string;
    productName?: string;
    productSku?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>;
  taxRate?: number;
  discountAmount?: number;
  dueDate?: Date;
  notes?: string;
}

export interface UpdateInvoiceData {
  items?: Array<{
    productId: string;
    productName?: string;
    productSku?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>;
  taxRate?: number;
  discountAmount?: number;
  dueDate?: Date;
  notes?: string;
  paymentStatus?: PaymentStatus;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  processedBy: string;
  processedAt: Date;
  createdAt: Date;
}

export interface CreatePaymentData {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface SalesReport {
  totalSales: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averageInvoiceValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  salesByPeriod: Array<{
    period: string;
    sales: number;
    invoices: number;
  }>;
}

export interface SalesStatistics {
  totalSales: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  overdueAmount: number;
  averageInvoiceValue: number;
  monthlySales: number;
  weeklySales: number;
  dailySales: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

export interface SalesTrend {
  period: string;
  sales: number;
  invoices: number;
  growth: number;
}

export interface PaymentMethodStats {
  method: PaymentMethod;
  count: number;
  amount: number;
  percentage: number;
}

export interface ClientPerformance {
  clientId: string;
  clientName: string;
  invoices: number;
  totalAmount: number;
  averageAmount: number;
  lastPurchase: Date;
}

export interface InvoiceFilters {
  clientId?: string;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface SalesFilters {
  startDate?: string;
  endDate?: string;
  clientId?: string;
  productId?: string;
  paymentMethod?: PaymentMethod;
}

export interface InvoiceSearchParams {
  clientId?: string;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// Client interface for sales context
export interface Client {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Product interface for sales context
export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  active: boolean;
}

// Dashboard data interface
export interface SalesDashboardData {
  stats: SalesStatistics;
  recentInvoices: Invoice[];
  topProducts: TopProduct[];
  salesTrend: SalesTrend[];
  paymentMethods: PaymentMethodStats[];
  overdueInvoices: Invoice[];
  clientPerformance: ClientPerformance[];
}
