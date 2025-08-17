import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthResponse, AuthStore } from '../types/auth.types';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setAuth: (auth: AuthResponse) => {
        set({
          user: auth.user,
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        // Store tokens in localStorage for API access
        localStorage.setItem('accessToken', auth.accessToken);
        localStorage.setItem('refreshToken', auth.refreshToken);
      },

      setUser: (user: User) => {
        set({ user });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('i18nextLng'); // Keep language preference
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      updateProfile: (profile: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...profile }
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selector functions
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useIsAdmin = () => {
  const user = useAuthStore((state) => state.user);
  return user?.roles?.includes('admin') || user?.roles?.includes('super-admin') || false;
};

// Permission and role helpers
export const useUserRoles = () => useAuthStore((state) => state.user?.roles || []);
export const useUserPermissions = () => useAuthStore((state) => state.user?.permissions || []);
export const useHasRole = (roleName: string) => {
  const roles = useUserRoles();
  return roles.includes(roleName);
};
export const useHasPermission = (permissionName: string) => {
  const permissions = useUserPermissions();
  return permissions.includes(permissionName);
};
export const useIsActive = () => useAuthStore((state) => state.user?.status === 'active');
