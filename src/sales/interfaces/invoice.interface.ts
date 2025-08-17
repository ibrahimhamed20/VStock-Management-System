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

export interface IInvoiceItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
}

export interface IInvoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  paymentTerms: string;
  items: IInvoiceItem[];
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
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateInvoice {
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

export interface IUpdateInvoice {
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

export interface IPayment {
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

export interface ICreatePayment {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface ISalesReport {
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
