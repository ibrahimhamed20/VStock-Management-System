// ============================================
// COMMON TYPES
// ============================================

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}

// ============================================
// AUTH TYPES
// ============================================

export interface User {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    permissions: string[];
    status: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

// ============================================
// INVENTORY TYPES
// ============================================

export interface Product {
    id: string;
    sku: string;
    name: string;
    description?: string;
    category?: string;
    supplier?: string;
    unitCost: number;
    unitPrice: number;
    stock: number;
    minStock: number;
    maxStock?: number;
    barcode?: string;
    classification?: 'A' | 'B' | 'C';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface StockMovement {
    id: string;
    productId: string;
    productName: string;
    type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN' | 'TRANSFER';
    quantity: number;
    previousStock: number;
    newStock: number;
    reason?: string;
    reference?: string;
    userId: string;
    username: string;
    createdAt: string;
}

export interface StockAdjustmentRequest {
    productId: string;
    quantity: number;
    type: 'ADD' | 'REMOVE' | 'SET';
    reason: string;
}

export interface Batch {
    id: string;
    batchNumber: string;
    productId: string;
    quantity: number;
    remainingQuantity: number;
    costPrice: number;
    expiryDate?: string;
    receivedDate: string;
    createdAt: string;
}

export interface StockAlert {
    lowStockCount: number;
    lowStockProducts: LowStockProduct[];
    expiringCount: number;
    expiringBatches: ExpiringBatch[];
}

export interface LowStockProduct {
    id: string;
    sku: string;
    name: string;
    currentStock: number;
    minStock: number;
    deficit: number;
}

export interface ExpiringBatch {
    batchId: string;
    productName: string;
    expiryDate: string;
    remainingQuantity: number;
    daysUntilExpiry: number;
}

// ============================================
// SALES TYPES
// ============================================

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT';

export interface InvoiceItem {
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    clientId: string;
    clientName: string;
    items: InvoiceItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    paidAmount: number;
    balance: number;
    paymentStatus: PaymentStatus;
    dueDate: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateInvoiceRequest {
    clientId: string;
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        discount?: number;
    }[];
    taxRate?: number;
    discountAmount?: number;
    dueDate?: string;
    notes?: string;
}

export interface Payment {
    id: string;
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
    notes?: string;
    receivedBy: string;
    createdAt: string;
}

export interface CreatePaymentRequest {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
    notes?: string;
}

export interface SalesDashboard {
    todaySales: number;
    todayInvoiceCount: number;
    weekSales: number;
    monthSales: number;
    pendingAmount: number;
    overdueAmount: number;
    recentInvoices: Invoice[];
}

// ============================================
// CLIENT TYPES
// ============================================

export interface Client {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    taxId?: string;
    tags: string[];
    totalPurchases: number;
    outstandingBalance: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClientRequest {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    taxId?: string;
    tags?: string[];
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> { }

export interface ClientTransaction {
    id: string;
    type: 'INVOICE' | 'PAYMENT' | 'REFUND' | 'CREDIT';
    amount: number;
    reference: string;
    description?: string;
    date: string;
}

// ============================================
// PURCHASING TYPES
// ============================================

export type PurchaseStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED' | 'OVERDUE';

export interface Supplier {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    contactPerson?: string;
    paymentTerms?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PurchaseItem {
    id: string;
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    receivedQuantity: number;
    unitCost: number;
    total: number;
}

export interface Purchase {
    id: string;
    purchaseNumber: string;
    supplierId: string;
    supplierName: string;
    items: PurchaseItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
    status: PurchaseStatus;
    expectedDate?: string;
    receivedDate?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
    totalProducts: number;
    lowStockCount: number;
    todaySales: number;
    todayInvoiceCount: number;
    pendingOrders: number;
    totalClients: number;
    totalInventoryValue: number;
    recentActivity: DashboardActivity[];
}

export interface DashboardActivity {
    id: string;
    type: 'SALE' | 'PURCHASE' | 'STOCK_ADJUSTMENT' | 'NEW_CLIENT';
    title: string;
    description: string;
    amount?: number;
    timestamp: string;
}
