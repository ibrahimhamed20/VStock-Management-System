import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
    Product,
    StockMovement,
    StockAdjustmentRequest,
    StockAlert,
    Invoice,
    CreateInvoiceRequest,
    Payment,
    CreatePaymentRequest,
    Client,
    CreateClientRequest,
    UpdateClientRequest,
    ClientTransaction,
    Supplier,
    Purchase,
    DashboardStats,
    Batch,
} from '../types';

// API Configuration
const getApiBaseUrl = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:3000';
        } else {
            return 'http://localhost:3000';
        }
    }
    return 'https://api.yourdomain.com';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.api.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                const token = await AsyncStorage.getItem('accessToken');
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
                }
                return Promise.reject(error);
            }
        );
    }

    // ============================================
    // AUTH ENDPOINTS
    // ============================================

    async login(username: string, password: string) {
        const response = await this.api.post('/auth/login', { username, password });
        return response.data;
    }

    async logout() {
        const response = await this.api.post('/auth/logout');
        return response.data;
    }

    async getProfile() {
        const response = await this.api.get('/auth/profile');
        return response.data;
    }

    // ============================================
    // DASHBOARD ENDPOINTS
    // ============================================

    async getDashboardStats(): Promise<DashboardStats> {
        // Aggregate data from multiple endpoints
        try {
            const [salesStats, stockAlerts, products] = await Promise.all([
                this.api.get('/sales/reports/dashboard').catch(() => ({ data: {} })),
                this.api.get('/inventory/reports/stock-alerts').catch(() => ({ data: { lowStockCount: 0 } })),
                this.api.get('/inventory/products').catch(() => ({ data: [] })),
            ]);

            const productList = Array.isArray(products.data) ? products.data : [];
            const totalInventoryValue = productList.reduce(
                (sum: number, p: Product) => sum + (p.unitCost * p.stock),
                0
            );

            return {
                totalProducts: productList.length,
                lowStockCount: stockAlerts.data?.lowStockCount || 0,
                todaySales: salesStats.data?.todayTotal || 0,
                todayInvoiceCount: salesStats.data?.todayCount || 0,
                pendingOrders: salesStats.data?.pendingCount || 0,
                totalClients: 0, // Will be fetched separately if needed
                totalInventoryValue,
                recentActivity: [],
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }

    // ============================================
    // INVENTORY ENDPOINTS
    // ============================================

    async getProducts(params?: { page?: number; limit?: number; search?: string }): Promise<Product[]> {
        const response = await this.api.get('/inventory/products', { params });
        return response.data;
    }

    async getProduct(id: string): Promise<Product> {
        const response = await this.api.get(`/inventory/products/${id}`);
        return response.data;
    }

    async getProductBySku(sku: string): Promise<Product> {
        const response = await this.api.get(`/inventory/products/sku/${sku}`);
        return response.data;
    }

    async searchProducts(query: string, category?: string): Promise<Product[]> {
        const response = await this.api.get('/inventory/search', {
            params: { q: query, category }
        });
        return response.data;
    }

    async getLowStockProducts(): Promise<Product[]> {
        const response = await this.api.get('/inventory/stock/low-stock');
        return response.data;
    }

    async getStockAlerts(): Promise<StockAlert> {
        const response = await this.api.get('/inventory/reports/stock-alerts');
        return response.data;
    }

    async getStockMovements(productId?: string, type?: string, limit?: number): Promise<StockMovement[]> {
        const response = await this.api.get('/inventory/stock/movements', {
            params: { productId, type, limit }
        });
        return response.data;
    }

    async adjustStock(data: StockAdjustmentRequest): Promise<Product> {
        const response = await this.api.post('/inventory/stock/adjust', data);
        return response.data;
    }

    async getCategories(): Promise<string[]> {
        const response = await this.api.get('/inventory/categories');
        return response.data;
    }

    async getProductBatches(productId: string): Promise<Batch[]> {
        const response = await this.api.get(`/inventory/batches/product/${productId}`);
        return response.data;
    }

    async getExpiringBatches(days?: number): Promise<any[]> {
        const response = await this.api.get('/inventory/batches/expiring', { params: { days } });
        return response.data;
    }

    // ============================================
    // SALES ENDPOINTS
    // ============================================

    async getInvoices(params?: { page?: number; limit?: number; status?: string }): Promise<Invoice[]> {
        const response = await this.api.get('/sales/invoices', { params });
        return response.data;
    }

    async getInvoice(id: string): Promise<Invoice> {
        const response = await this.api.get(`/sales/invoices/${id}`);
        return response.data;
    }

    async getInvoicesByClient(clientId: string): Promise<Invoice[]> {
        const response = await this.api.get(`/sales/invoices/client/${clientId}`);
        return response.data;
    }

    async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
        const response = await this.api.post('/sales/invoices', data);
        return response.data;
    }

    async getNextInvoiceNumber(): Promise<{ invoiceNumber: string }> {
        const response = await this.api.get('/sales/next-invoice-number');
        return response.data;
    }

    async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
        const response = await this.api.get(`/sales/payments/invoice/${invoiceId}`);
        return response.data;
    }

    async createPayment(data: CreatePaymentRequest): Promise<Payment> {
        const response = await this.api.post('/sales/payments', data);
        return response.data;
    }

    async getOverdueInvoices(): Promise<Invoice[]> {
        const response = await this.api.get('/sales/overdue');
        return response.data;
    }

    async getSalesDashboard(): Promise<any> {
        const response = await this.api.get('/sales/reports/dashboard');
        return response.data;
    }

    async getTopProducts(limit: number = 10): Promise<any[]> {
        const response = await this.api.get('/sales/reports/top-products', { params: { limit } });
        return response.data;
    }

    // ============================================
    // CLIENT ENDPOINTS
    // ============================================

    async getClients(params?: { page?: number; limit?: number; search?: string }): Promise<Client[]> {
        const response = await this.api.get('/clients', { params });
        return response.data;
    }

    async getClient(id: string): Promise<Client> {
        const response = await this.api.get(`/clients/${id}`);
        return response.data;
    }

    async createClient(data: CreateClientRequest): Promise<Client> {
        const response = await this.api.post('/clients', data);
        return response.data;
    }

    async updateClient(id: string, data: UpdateClientRequest): Promise<Client> {
        const response = await this.api.patch(`/clients/${id}`, data);
        return response.data;
    }

    async deleteClient(id: string): Promise<void> {
        await this.api.delete(`/clients/${id}`);
    }

    async getClientTransactions(clientId: string): Promise<ClientTransaction[]> {
        const response = await this.api.get(`/clients/${clientId}/transactions`);
        return response.data;
    }

    async getClientsByTag(tag: string): Promise<Client[]> {
        const response = await this.api.get(`/clients/tag/${tag}`);
        return response.data;
    }

    // ============================================
    // PURCHASING ENDPOINTS
    // ============================================

    async getSuppliers(): Promise<Supplier[]> {
        const response = await this.api.get('/purchasing/suppliers');
        return response.data;
    }

    async getSupplier(id: string): Promise<Supplier> {
        const response = await this.api.get(`/purchasing/suppliers/${id}`);
        return response.data;
    }

    async getPurchases(params?: { page?: number; limit?: number; status?: string }): Promise<Purchase[]> {
        const response = await this.api.get('/purchasing/purchases', { params });
        return response.data;
    }

    async getPurchase(id: string): Promise<Purchase> {
        const response = await this.api.get(`/purchasing/purchases/${id}`);
        return response.data;
    }

    async receivePurchase(id: string, items: Array<{ itemId: string; receivedQuantity: number }>): Promise<Purchase> {
        const response = await this.api.post(`/purchasing/purchases/${id}/receive`, items);
        return response.data;
    }

    // ============================================
    // GENERIC METHODS
    // ============================================

    get<T>(url: string, params?: any) {
        return this.api.get<T>(url, { params });
    }

    post<T>(url: string, data?: any) {
        return this.api.post<T>(url, data);
    }

    put<T>(url: string, data?: any) {
        return this.api.put<T>(url, data);
    }

    patch<T>(url: string, data?: any) {
        return this.api.patch<T>(url, data);
    }

    delete<T>(url: string) {
        return this.api.delete<T>(url);
    }
}

export const apiService = new ApiService();
export default apiService;
