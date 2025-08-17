// Authentication Types based on backend implementation
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
  status: 'active' | 'blocked' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface LoginCredentials {
  username: string; // Can be username or email
  password: string;
}

// Form-specific types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

export interface PasswordResetFormData {
  email: string;
}

export interface PasswordResetConfirmFormData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  userRoles: string[];
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface UserLoginHistory {
  id: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  loginAt: Date;
  success: boolean;
  failureReason?: string;
}

// Store interface
export interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setAuth: (auth: AuthResponse) => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  updateProfile: (profile: Partial<User>) => void;
}

// Selector types
export type AuthUser = User | null;
export type IsAdmin = boolean;

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
