import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this to your actual API URL
const API_BASE_URL = 'http://10.0.2.2:3000'; // Android emulator localhost
// For physical device, use your computer's IP: 'http://192.168.x.x:3000'

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
                    // Token expired - clear storage and redirect to login
                    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
                    // Navigation will be handled by auth state
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
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

    // Dashboard endpoints
    async getDashboardStats() {
        const response = await this.api.get('/dashboard/stats');
        return response.data;
    }

    // Inventory endpoints
    async getProducts(params?: { page?: number; limit?: number; search?: string }) {
        const response = await this.api.get('/products', { params });
        return response.data;
    }

    async getProduct(id: string) {
        const response = await this.api.get(`/products/${id}`);
        return response.data;
    }

    async getProductByBarcode(barcode: string) {
        const response = await this.api.get(`/products/barcode/${barcode}`);
        return response.data;
    }

    async getLowStockProducts() {
        const response = await this.api.get('/products/low-stock');
        return response.data;
    }

    // Stock endpoints
    async adjustStock(productId: string, data: { quantity: number; type: 'add' | 'remove'; reason: string }) {
        const response = await this.api.post(`/stock/${productId}/adjust`, data);
        return response.data;
    }

    // Sales endpoints
    async getSalesInvoices(params?: { page?: number; limit?: number }) {
        const response = await this.api.get('/sales/invoices', { params });
        return response.data;
    }

    async createInvoice(data: any) {
        const response = await this.api.post('/sales/invoices', data);
        return response.data;
    }

    // Clients endpoints
    async getClients(params?: { page?: number; limit?: number; search?: string }) {
        const response = await this.api.get('/clients', { params });
        return response.data;
    }

    async getClient(id: string) {
        const response = await this.api.get(`/clients/${id}`);
        return response.data;
    }

    // Generic methods
    get<T>(url: string, params?: any) {
        return this.api.get<T>(url, { params });
    }

    post<T>(url: string, data?: any) {
        return this.api.post<T>(url, data);
    }

    put<T>(url: string, data?: any) {
        return this.api.put<T>(url, data);
    }

    delete<T>(url: string) {
        return this.api.delete<T>(url);
    }
}

export const apiService = new ApiService();
export default apiService;
