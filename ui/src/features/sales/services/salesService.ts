import apiService from '../../core/services/api';
import type {
  Invoice,
  CreateInvoiceData,
  UpdateInvoiceData,
  Payment,
  CreatePaymentData,
  SalesReport,
  InvoiceFilters,
  SalesFilters,
  InvoiceSearchParams,
  Client,
  Product,
  SalesDashboardData,
  TopProduct,
  SalesTrend,
  PaymentMethodStats,
  ClientPerformance,
  PaymentMethod,
} from '../types';

class SalesService {
  // Invoice Management
  async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    return await apiService.post<Invoice>('/sales/invoices', data);
  }

  async getInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {
    const params = new URLSearchParams();
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiService.get<Invoice[]>(`/sales/invoices?${params.toString()}`);
    return response;
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    return await apiService.get<Invoice>(`/sales/invoices/${id}`);
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice> {
    return await apiService.get<Invoice>(`/sales/invoices/number/${invoiceNumber}`);
  }

  async getInvoicesByClient(clientId: string): Promise<Invoice[]> {
    return await apiService.get<Invoice[]>(`/sales/invoices/client/${clientId}`);
  }

  async getInvoicesByStatus(status: string): Promise<Invoice[]> {
    return await apiService.get<Invoice[]>(`/sales/invoices/status/${status}`);
  }

  async updateInvoice(id: string, data: UpdateInvoiceData): Promise<Invoice> {
    return await apiService.put<Invoice>(`/sales/invoices/${id}`, data);
  }

  async deleteInvoice(id: string): Promise<{ message: string }> {
    return await apiService.delete<{ message: string }>(`/sales/invoices/${id}`);
  }

  async cancelInvoice(id: string): Promise<void> {
    return await apiService.post<void>(`/sales/invoices/${id}/cancel`);
  }

  async markInvoiceOverdue(id: string): Promise<void> {
    return await apiService.post<void>(`/sales/invoices/${id}/mark-overdue`);
  }

  // Payment Management
  async createPayment(data: CreatePaymentData): Promise<Payment> {
    return await apiService.post<Payment>('/sales/payments', data);
  }

  async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    return await apiService.get<Payment[]>(`/sales/payments/invoice/${invoiceId}`);
  }

  // Reports and Analytics
  async getSalesReport(filters?: SalesFilters): Promise<SalesReport> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    return await apiService.get<SalesReport>(`/sales/reports/sales?${params.toString()}`);
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    return await apiService.get<Invoice[]>('/sales/reports/overdue');
  }

  async getDashboardStats(): Promise<SalesDashboardData> {
    return await apiService.get<SalesDashboardData>('/sales/reports/dashboard');
  }

  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    return await apiService.get<TopProduct[]>(`/sales/analytics/top-products?limit=${limit}`);
  }

  async getSalesTrend(months: number = 12): Promise<SalesTrend[]> {
    return await apiService.get<SalesTrend[]>(`/sales/analytics/sales-trend?months=${months}`);
  }

  async getPaymentMethodStats(): Promise<PaymentMethodStats[]> {
    const data = await apiService.get<Record<string, { count: number; amount: number }>>('/sales/analytics/payment-methods');
    
    // Convert object to array format
    return Object.entries(data).map(([method, stats]) => ({
      method: method as PaymentMethod,
      count: stats.count,
      amount: stats.amount,
      percentage: 0, // Will be calculated on frontend
    }));
  }

  async getClientPerformance(): Promise<ClientPerformance[]> {
    return await apiService.get<ClientPerformance[]>('/sales/analytics/client-performance');
  }

  // Search and Filter
  async searchInvoices(params: InvoiceSearchParams): Promise<Invoice[]> {
    const searchParams = new URLSearchParams();
    if (params.clientId) searchParams.append('clientId', params.clientId);
    if (params.status) searchParams.append('status', params.status);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.search) searchParams.append('search', params.search);

    return await apiService.get<Invoice[]>(`/sales/search/invoices?${searchParams.toString()}`);
  }

  // Utility
  async getNextInvoiceNumber(): Promise<{ invoiceNumber: string }> {
    return await apiService.get<{ invoiceNumber: string }>('/sales/next-invoice-number');
  }

  // Client Management (for sales context)
  async getClients(): Promise<Client[]> {
    return await apiService.get<Client[]>('/clients');
  }

  async getClientById(id: string): Promise<Client> {
    return await apiService.get<Client>(`/clients/${id}`);
  }

  // Product Management (for sales context)
  async getProducts(): Promise<Product[]> {
    return await apiService.get<Product[]>('/inventory/products');
  }

  async getProductById(id: string): Promise<Product> {
    return await apiService.get<Product>(`/inventory/products/${id}`);
  }

  async getActiveProducts(): Promise<Product[]> {
    const products = await apiService.get<Product[]>('/inventory/products');
    return products.filter((product: Product) => product.active);
  }

}

export const salesService = new SalesService();
