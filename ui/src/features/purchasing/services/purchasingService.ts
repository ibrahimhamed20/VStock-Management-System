import apiService from '../../core/services/api';
import type {
  Purchase,
  CreatePurchaseData,
  UpdatePurchaseData,
  ReceivePurchaseData,
  Supplier,
  CreateSupplierData,
  UpdateSupplierData,
  PurchaseReport,
  PurchaseFilters,
  PurchaseSearchParams,
  PurchasingDashboardData,
  TopSupplier,
  PurchaseTrend,
  SupplierPerformance,
  PurchaseStatus,
  Product,
} from '../types';

class PurchasingService {
  // Purchase Management
  async createPurchase(data: CreatePurchaseData): Promise<Purchase> {
    return await apiService.post<Purchase>('/purchasing/purchases', data);
  }

  async getPurchases(filters?: PurchaseFilters): Promise<Purchase[]> {
    // Backend doesn't support filters on /purchases endpoint
    // Use /search/purchases when filters are provided
    if (filters && (filters.supplierId || filters.status || filters.startDate || filters.endDate)) {
      return this.searchPurchases({
        supplierId: filters.supplierId,
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }
    
    // No filters, get all purchases
    const response = await apiService.get<Purchase[]>('/purchasing/purchases');
    
    // Apply client-side search filter if provided
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      return response.filter(p => 
        p.purchaseNumber.toLowerCase().includes(searchLower) ||
        p.supplierName.toLowerCase().includes(searchLower)
      );
    }
    
    return response;
  }

  async getPurchaseById(id: string): Promise<Purchase> {
    return await apiService.get<Purchase>(`/purchasing/purchases/${id}`);
  }

  async getPurchaseByNumber(purchaseNumber: string): Promise<Purchase> {
    return await apiService.get<Purchase>(`/purchasing/purchases/number/${purchaseNumber}`);
  }

  async getPurchasesBySupplier(supplierId: string): Promise<Purchase[]> {
    return await apiService.get<Purchase[]>(`/purchasing/purchases/supplier/${supplierId}`);
  }

  async getPurchasesByStatus(status: PurchaseStatus): Promise<Purchase[]> {
    return await apiService.get<Purchase[]>(`/purchasing/purchases/status/${status}`);
  }

  async updatePurchase(id: string, data: UpdatePurchaseData): Promise<Purchase> {
    return await apiService.put<Purchase>(`/purchasing/purchases/${id}`, data);
  }

  async deletePurchase(id: string): Promise<{ message: string }> {
    return await apiService.delete<{ message: string }>(`/purchasing/purchases/${id}`);
  }

  async receivePurchase(id: string, data: ReceivePurchaseData): Promise<Purchase> {
    return await apiService.post<Purchase>(`/purchasing/purchases/${id}/receive`, data);
  }

  async approvePurchase(id: string): Promise<Purchase> {
    return await apiService.post<Purchase>(`/purchasing/purchases/${id}/approve`);
  }

  async orderPurchase(id: string): Promise<Purchase> {
    return await apiService.post<Purchase>(`/purchasing/purchases/${id}/order`);
  }

  async cancelPurchase(id: string): Promise<Purchase> {
    return await apiService.post<Purchase>(`/purchasing/purchases/${id}/cancel`);
  }

  // Supplier Management
  async createSupplier(data: CreateSupplierData): Promise<Supplier> {
    return await apiService.post<Supplier>('/purchasing/suppliers', data);
  }

  async getSuppliers(): Promise<Supplier[]> {
    return await apiService.get<Supplier[]>('/purchasing/suppliers');
  }

  async getSupplierById(id: string): Promise<Supplier> {
    return await apiService.get<Supplier>(`/purchasing/suppliers/${id}`);
  }

  async updateSupplier(id: string, data: UpdateSupplierData): Promise<Supplier> {
    return await apiService.put<Supplier>(`/purchasing/suppliers/${id}`, data);
  }

  async deleteSupplier(id: string): Promise<{ message: string }> {
    return await apiService.delete<{ message: string }>(`/purchasing/suppliers/${id}`);
  }

  // Reports and Analytics
  async getPurchaseReport(filters?: { startDate?: string; endDate?: string }): Promise<PurchaseReport> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    return await apiService.get<PurchaseReport>(`/purchasing/reports/purchases?${params.toString()}`);
  }

  async getOverduePurchases(): Promise<Purchase[]> {
    return await apiService.get<Purchase[]>('/purchasing/reports/overdue');
  }

  async getDashboardStats(): Promise<PurchasingDashboardData> {
    // Backend returns: { purchaseReport, overduePurchases (count), overdueAmount }
    interface DashboardResponse {
      purchaseReport: PurchaseReport;
      overduePurchases: number;
      overdueAmount: number;
    }
    const dashboardData = await apiService.get<DashboardResponse>('/purchasing/reports/dashboard');
    const purchases = await this.getPurchases();
    const topSuppliers = await this.getTopSuppliers(10);
    const purchaseTrend = await this.getPurchaseTrend(12);
    const overduePurchases = await this.getOverduePurchases();
    const supplierPerformance = await this.getSupplierPerformance();

    const purchaseReport = dashboardData.purchaseReport || {};

    // Calculate statistics
    const stats = {
      totalPurchases: purchaseReport.totalPurchases || 0,
      totalAmount: purchaseReport.totalAmount || 0,
      pendingPurchases: purchaseReport.pendingPurchases || 0,
      receivedPurchases: purchaseReport.receivedPurchases || 0,
      overduePurchases: dashboardData.overduePurchases || 0,
      overdueAmount: dashboardData.overdueAmount || 0,
      averagePurchaseValue: purchaseReport.averagePurchaseValue || 0,
      monthlyPurchases: 0,
      weeklyPurchases: 0,
      dailyPurchases: 0,
    };

    // Calculate monthly, weekly, daily purchases
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);

    stats.monthlyPurchases = purchases.filter(
      (p: Purchase) => new Date(p.orderDate) >= monthStart
    ).length;
    stats.weeklyPurchases = purchases.filter(
      (p: Purchase) => new Date(p.orderDate) >= weekStart
    ).length;
    stats.dailyPurchases = purchases.filter(
      (p: Purchase) => new Date(p.orderDate) >= dayStart
    ).length;

    // Get recent purchases
    const recentPurchases = purchases
      .sort((a: Purchase, b: Purchase) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);

    return {
      stats,
      recentPurchases,
      topSuppliers,
      purchaseTrend,
      overduePurchases,
      supplierPerformance,
    };
  }

  async getTopSuppliers(limit: number = 10): Promise<TopSupplier[]> {
    interface TopSupplierResponse {
      supplierId: string;
      supplierName: string;
      purchases: number;
      totalAmount: number;
    }
    const data = await apiService.get<TopSupplierResponse[]>(`/purchasing/analytics/top-suppliers?limit=${limit}`);
    const total = data.reduce((sum, item) => sum + item.totalAmount, 0);
    
    return data.map((item) => ({
      supplierId: item.supplierId,
      supplierName: item.supplierName,
      purchases: item.purchases,
      totalAmount: item.totalAmount,
      percentage: total > 0 ? (item.totalAmount / total) * 100 : 0,
    }));
  }

  async getPurchaseTrend(months: number = 12): Promise<PurchaseTrend[]> {
    interface PurchaseTrendResponse {
      period: string;
      purchases: number;
      amount: number;
    }
    const data = await apiService.get<PurchaseTrendResponse[]>(`/purchasing/analytics/purchase-trend?months=${months}`);
    
    // Backend returns: { period, purchases, amount }
    // Calculate growth on frontend
    return data.map((item, index) => {
      const prevAmount = index > 0 ? data[index - 1].amount : item.amount;
      const growth = prevAmount > 0 
        ? ((item.amount - prevAmount) / prevAmount) * 100 
        : 0;
      
      return {
        period: item.period,
        purchases: item.purchases,
        amount: item.amount,
        growth: Number(growth.toFixed(2)),
      };
    });
  }

  async getSupplierPerformance(): Promise<SupplierPerformance[]> {
    interface SupplierPerformanceResponse {
      supplierId: string;
      supplierName: string;
      purchases: number;
      totalAmount: number;
      averageAmount: number;
    }
    const data = await apiService.get<SupplierPerformanceResponse[]>('/purchasing/analytics/supplier-performance');
    
    // Backend returns: { supplierId, supplierName, purchases, totalAmount, averageAmount }
    // Note: lastPurchase and onTimeDeliveryRate are not provided by backend
    // We'll need to fetch purchases to calculate these, or set defaults
    const purchases = await this.getPurchases();
    
    return data.map((item) => {
      // Find last purchase for this supplier
      const supplierPurchases = purchases
        .filter(p => p.supplierId === item.supplierId)
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      
      const lastPurchase = supplierPurchases.length > 0 
        ? new Date(supplierPurchases[0].orderDate)
        : new Date();
      
      // Calculate on-time delivery rate (simplified - would need actual delivery tracking)
      const onTimePurchases = supplierPurchases.filter(p => {
        if (!p.actualDeliveryDate || !p.expectedDeliveryDate) return false;
        return new Date(p.actualDeliveryDate) <= new Date(p.expectedDeliveryDate);
      });
      const onTimeDeliveryRate = supplierPurchases.length > 0
        ? (onTimePurchases.length / supplierPurchases.length) * 100
        : 0;
      
      return {
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        purchases: item.purchases,
        totalAmount: item.totalAmount,
        averageAmount: item.averageAmount || (item.purchases > 0 ? item.totalAmount / item.purchases : 0),
        lastPurchase,
        onTimeDeliveryRate: Number(onTimeDeliveryRate.toFixed(2)),
      };
    });
  }

  // Search and Filter
  async searchPurchases(params: PurchaseSearchParams): Promise<Purchase[]> {
    const searchParams = new URLSearchParams();
    // Backend search endpoint only supports: supplierId, status, startDate, endDate
    if (params.supplierId) searchParams.append('supplierId', params.supplierId);
    if (params.status) searchParams.append('status', params.status);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    // Note: paymentStatus and search are not supported by backend

    const results = await apiService.get<Purchase[]>(`/purchasing/search/purchases?${searchParams.toString()}`);
    
    // Apply client-side search filter if provided
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      return results.filter(p => 
        p.purchaseNumber.toLowerCase().includes(searchLower) ||
        p.supplierName.toLowerCase().includes(searchLower)
      );
    }
    
    return results;
  }

  // Utility
  async getNextPurchaseNumber(): Promise<{ purchaseNumber: string }> {
    return await apiService.get<{ purchaseNumber: string }>('/purchasing/next-purchase-number');
  }

  // Product Management (for purchasing context)
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

export const purchasingService = new PurchasingService();

