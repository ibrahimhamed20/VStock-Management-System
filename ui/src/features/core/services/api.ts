import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { useAuthStore } from '../../auth/stores/auth.store';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/refresh-token`,
            { refreshToken }
          );

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Update auth store
          const { setTokens } = useAuthStore.getState();
          setTokens(accessToken, refreshToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, logout user
        const { logout } = useAuthStore.getState();
        logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // GET request
  get: async <T>(url: string, config?: any): Promise<T> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: any, config?: any): Promise<T> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  // PUT request
  put: async <T>(url: string, data?: any, config?: any): Promise<T> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async <T>(url: string, data?: any, config?: any): Promise<T> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string, config?: any): Promise<T> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
};

export default apiService;
