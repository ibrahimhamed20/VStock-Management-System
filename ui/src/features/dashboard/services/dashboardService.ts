import apiService from "@/features/core/services/api";

export interface DashboardStats {
  totalSales: number;
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  lowStockProducts: number;
  pendingInvoices: number;
  pendingPayments: number;
}

export interface SystemStatus {
  status: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  timestamp: string;
}

export interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: string;
  progress: number;
  date: string;
}

export interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  rating: number;
  sku: string;
}

export interface LowStockProduct {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  sku: string;
}

export interface PendingInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  status: string;
  dueDate: string;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  totalAmount: number;
  paymentStatus: string;
  dueDate: Date;
  issueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductData {
  id: string;
  sku: string;
  name: string;
  stock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  sellingPrice: number;
  category?: string;
  supplier?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientData {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface FinancialData {
  balanceSheet: {
    asOf: string;
    assets: Array<{ name: string; balance: number; type: string }>;
    liabilities: Array<{ name: string; balance: number; type: string }>;
    equity: Array<{ name: string; balance: number; type: string }>;
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
  } | null;
  incomeStatement: {
    from: string;
    to: string;
    revenue: Array<{ accountId: string; amount: number }>;
    expenses: Array<{ accountId: string; amount: number }>;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
  } | null;
}

export class DashboardService {
  
  static async getSystemStatus(): Promise<SystemStatus> {
    try {
      const response = await apiService.get<SystemStatus>(`/status`);
      return response;
    } catch (error) {
      console.error('Error fetching system status:', error);
      throw error;
    }
  }

  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch data from multiple endpoints
      const [products, invoices, clients, lowStock] = await Promise.all([
        apiService.get<ProductData[]>(`/inventory/products`),
        apiService.get<InvoiceData[]>(`/sales/invoices`),
        apiService.get<ClientData[]>(`/clients`),
        apiService.get<LowStockProduct[]>(`/inventory/stock/low-stock`)
      ]);

      // Calculate totals
      const totalSales = invoices.length;
      const totalProducts = products.length;
      const totalCustomers = clients.length;
      const totalOrders = invoices.length;
      const totalRevenue = invoices.reduce((sum: number, inv: InvoiceData) => sum + inv.totalAmount, 0);
      const pendingInvoices = invoices.filter((inv: InvoiceData) => inv.paymentStatus === 'pending').length;
      const pendingPayments = invoices.filter((inv: InvoiceData) => inv.paymentStatus === 'pending').length;
      const lowStockProducts = lowStock.length;

      // Mock financial data for now (replace with real accounting API calls)
      const totalExpenses = totalRevenue * 0.6; // Mock: 60% of revenue
      const netIncome = totalRevenue - totalExpenses;

      return {
        totalSales,
        totalProducts,
        totalCustomers,
        totalOrders,
        totalRevenue,
        totalExpenses,
        netIncome,
        lowStockProducts,
        pendingInvoices,
        pendingPayments
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  static async getRecentOrders(): Promise<RecentOrder[]> {
    try {
      const invoices = await apiService.get<InvoiceData[]>(`/sales/invoices`);

      return invoices.slice(0, 5).map((inv: InvoiceData) => ({
        id: inv.id,
        customer: inv.clientName,
        amount: inv.totalAmount,
        status: inv.paymentStatus === 'paid' ? 'completed' : 'pending',
        progress: inv.paymentStatus === 'paid' ? 100 : 65,
        date: inv.createdAt.toISOString()
      }));
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  }

  static async getTopProducts(): Promise<TopProduct[]> {
    try {
      const products = await apiService.get<ProductData[]>(`/inventory/products`);

      // Mock top products data (replace with real analytics API)
      return products.slice(0, 3).map((product: ProductData) => ({
        name: product.name,
        sales: Math.floor(Math.random() * 200) + 50, // Mock sales data
        revenue: Math.floor(Math.random() * 20000) + 5000, // Mock revenue
        rating: 4.5 + (Math.random() * 0.5), // Mock rating
        sku: product.sku
      }));
    } catch (error) {
      console.error('Error fetching top products:', error);
      return [];
    }
  }

  static async getLowStockProducts(): Promise<LowStockProduct[]> {
    try {
      const products = await apiService.get<LowStockProduct[]>(`/inventory/stock/low-stock`);

      return products.map((product: LowStockProduct) => ({
        id: product.id,
        name: product.name,
        currentStock: product.currentStock,
        minStock: product.minStock,
        sku: product.sku
      }));
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return [];
    }
  }

  static async getPendingInvoices(): Promise<PendingInvoice[]> {
    try {
      const invoices = await apiService.get<InvoiceData[]>(`/sales/invoices`);

      // Filter for pending invoices on the frontend since the backend doesn't have a status filter
      const pendingInvoices = invoices.filter(inv => inv.paymentStatus === 'pending');

      return pendingInvoices.slice(0, 5).map((inv: InvoiceData) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.clientName,
        amount: inv.totalAmount,
        status: inv.paymentStatus,
        dueDate: inv.dueDate.toISOString()
      }));
    } catch (error) {
      console.error('Error fetching pending invoices:', error);
      return [];
    }
  }

  static async getFinancialSummary(): Promise<FinancialData> {
    try {
      const [balance, income] = await Promise.all([
        apiService.get<FinancialData>(`/reports/balance-sheet`),
        apiService.get<FinancialData>(`/reports/income-statement`)
      ]);

      return { balanceSheet: balance.balanceSheet, incomeStatement: income.incomeStatement };
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      return { balanceSheet: null, incomeStatement: null };
    }
  }
}
