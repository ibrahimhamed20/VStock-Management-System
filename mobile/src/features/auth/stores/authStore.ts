import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../../../services/api';

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

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start as loading to check stored auth
    error: null,

    login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.login(username, password);

            // Store tokens
            await AsyncStorage.setItem('accessToken', response.accessToken);
            await AsyncStorage.setItem('refreshToken', response.refreshToken);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));

            set({
                user: response.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
            set({
                isLoading: false,
                error: errorMessage,
                isAuthenticated: false,
                user: null,
            });
            return false;
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await apiService.logout();
        } catch (error) {
            // Ignore logout API errors
        } finally {
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const userJson = await AsyncStorage.getItem('user');

            if (token && userJson) {
                const user = JSON.parse(userJson);
                // Optionally verify token with API
                try {
                    const profile = await apiService.getProfile();
                    set({
                        user: profile,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch {
                    // Token invalid, clear storage
                    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            } else {
                set({
                    isLoading: false,
                    isAuthenticated: false,
                });
            }
        } catch (error) {
            set({
                isLoading: false,
                isAuthenticated: false,
                user: null,
            });
        }
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;
