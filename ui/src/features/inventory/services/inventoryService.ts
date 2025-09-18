import apiService from '@/features/core/services/api';
import type { 
  Product, 
  CreateProductData, 
  UpdateProductData, 
  StockAdjustment,
  Batch,
  CreateBatchData,
  UpdateBatchData,
  BatchExpiry,
  StockMovement,
  StockValueReport,
  StockAlerts,
  ABCClassification,
  ProductSearchParams
} from '../types/inventory.types';

export class InventoryService {
  // Product Management
  static async getProducts(): Promise<Product[]> {
    try {
      const response = await apiService.get<Product[]>('/inventory/products');
      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  static async getProductById(id: string): Promise<Product> {
    try {
      const response = await apiService.get<Product>(`/inventory/products/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  static async getProductBySku(sku: string): Promise<Product> {
    try {
      const response = await apiService.get<Product>(`/inventory/products/sku/${sku}`);
      return response;
    } catch (error) {
      console.error('Error fetching product by SKU:', error);
      throw error;
    }
  }

  static async createProduct(productData: CreateProductData): Promise<Product> {
    try {
      const response = await apiService.post<Product>('/inventory/products', productData);
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async updateProduct(id: string, productData: UpdateProductData): Promise<Product> {
    try {
      const response = await apiService.put<Product>(`/inventory/products/${id}`, productData);
      return response;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async deleteProduct(id: string): Promise<{ message: string }> {
    try {
      const response = await apiService.delete<{ message: string }>(`/inventory/products/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Stock Management
  static async adjustStock(stockAdjustment: StockAdjustment): Promise<Product> {
    try {
      const response = await apiService.post<Product>('/inventory/stock/adjust', stockAdjustment);
      return response;
    } catch (error) {
      console.error('Error adjusting stock:', error);
      throw error;
    }
  }

  static async getLowStockProducts(): Promise<Product[]> {
    try {
      const response = await apiService.get<Product[]>('/inventory/stock/low-stock');
      return response;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }

  static async getStockMovements(params?: {
    productId?: string;
    type?: string;
    limit?: number;
  }): Promise<StockMovement[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.productId) queryParams.append('productId', params.productId);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `/inventory/stock/movements${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<StockMovement[]>(url);
      return response;
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw error;
    }
  }

  // Batch Management
  static async createBatch(batchData: CreateBatchData): Promise<Batch> {
    try {
      const response = await apiService.post<Batch>('/inventory/batches', batchData);
      return response;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  }

  static async getBatchesByProduct(productId: string): Promise<Batch[]> {
    try {
      const response = await apiService.get<Batch[]>(`/inventory/batches/product/${productId}`);
      return response;
    } catch (error) {
      console.error('Error fetching batches by product:', error);
      throw error;
    }
  }

  static async getExpiringBatches(days?: number): Promise<BatchExpiry[]> {
    try {
      const url = `/inventory/batches/expiring${days ? `?days=${days}` : ''}`;
      const response = await apiService.get<BatchExpiry[]>(url);
      return response;
    } catch (error) {
      console.error('Error fetching expiring batches:', error);
      throw error;
    }
  }

  // Reports
  static async getABCClassificationReport(): Promise<ABCClassification[]> {
    try {
      const response = await apiService.get<ABCClassification[]>('/inventory/reports/abc-classification');
      return response;
    } catch (error) {
      console.error('Error fetching ABC classification report:', error);
      throw error;
    }
  }

  static async getStockValueReport(): Promise<StockValueReport> {
    try {
      const response = await apiService.get<StockValueReport>('/inventory/reports/stock-value');
      return response;
    } catch (error) {
      console.error('Error fetching stock value report:', error);
      throw error;
    }
  }

  static async getStockAlerts(): Promise<StockAlerts> {
    try {
      const response = await apiService.get<StockAlerts>('/inventory/reports/stock-alerts');
      return response;
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      throw error;
    }
  }

  // Search and Filter
  static async searchProducts(params: ProductSearchParams): Promise<Product[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.q) queryParams.append('q', params.q);
      if (params.category) queryParams.append('category', params.category);
      if (params.classification) queryParams.append('classification', params.classification);
      if (params.supplier) queryParams.append('supplier', params.supplier);

      const url = `/inventory/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<Product[]>(url);
      return response;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      const response = await apiService.get<string[]>('/inventory/categories');
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  static async getSuppliers(): Promise<string[]> {
    try {
      const response = await apiService.get<string[]>('/inventory/suppliers');
      return response;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }
}
