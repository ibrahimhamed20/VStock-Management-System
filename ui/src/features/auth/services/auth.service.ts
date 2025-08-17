import type { 
  User, 
  Role, 
  Permission, 
  ApiResponse, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  ProfileUpdate,
  PasswordChange,
  PasswordResetRequest,
  PasswordReset,
  PaginatedResponse,
  AuditLog,
  UserLoginHistory
} from '../types/auth.types';
import { apiService } from '@core/services/api';

export class AuthService {
  // Authentication
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/login', credentials);
  }

  static async register(data: RegisterData): Promise<ApiResponse<User>> {
    return apiService.post<ApiResponse<User>>('/auth/register', data);
  }

  static async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<ApiResponse<{ message: string }>>('/auth/logout');
  }

  // Password Management
  static async requestPasswordReset(data: PasswordResetRequest): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<ApiResponse<{ message: string }>>('/auth/password-reset-request', data);
  }

  static async resetPassword(data: PasswordReset): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<ApiResponse<{ message: string }>>('/auth/password-reset', data);
  }

  static async changePassword(data: PasswordChange): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<ApiResponse<{ message: string }>>('/auth/change-password', data);
  }

  // Token Management
  static async refreshToken(): Promise<{ accessToken: string }> {
    return apiService.post<{ accessToken: string }>('/auth/refresh-token');
  }

  // User Profile
  static async getProfile(): Promise<User> {
    return apiService.get<User>('/auth/profile');
  }

  static async updateProfile(data: ProfileUpdate): Promise<ApiResponse<User>> {
    return apiService.put<ApiResponse<User>>('/auth/profile', data);
  }

  // Current User Profile (using profile/me endpoints)
  static async getCurrentUserProfile(): Promise<User> {
    return apiService.get<User>('/users/profile/me');
  }

  static async updateCurrentUserProfile(data: ProfileUpdate): Promise<User> {
    return apiService.put<User>('/users/profile/me', data);
  }

  // Admin Functions
  static async getAuditLogs(
    userId?: string, 
    limit: number = 100,
    page: number = 1
  ): Promise<PaginatedResponse<AuditLog>> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (limit) params.append('limit', limit.toString());
    if (page) params.append('page', page.toString());
    
    return apiService.get<PaginatedResponse<AuditLog>>(`/auth/audit-logs?${params.toString()}`);
  }

  static async getUserLoginHistory(
    userId?: string,
    limit: number = 100,
    page: number = 1
  ): Promise<PaginatedResponse<UserLoginHistory>> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (limit) params.append('limit', limit.toString());
    if (page) params.append('page', page.toString());
    
    return apiService.get<PaginatedResponse<UserLoginHistory>>(`/auth/login-history?${params.toString()}`);
  }

  // User Management (Admin only)
  static async getUsers(
    limit: number = 20,
    page: number = 1,
    search?: string,
    role?: string,
    status?: string
  ): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (page) params.append('page', page.toString());
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    
    return apiService.get<PaginatedResponse<User>>(`/users?${params.toString()}`);
  }

  static async getUserById(userId: string): Promise<User> {
    return apiService.get<User>(`/users/${userId}`);
  }

  static async updateUser(userId: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.put<ApiResponse<User>>(`/users/${userId}`, data);
  }

  static async deleteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete<ApiResponse<{ message: string }>>(`/users/${userId}`);
  }

  static async blockUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.patch<ApiResponse<{ message: string }>>(`/users/${userId}/block`);
  }

  static async unblockUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.patch<ApiResponse<{ message: string }>>(`/users/${userId}/unblock`);
  }

  // Role Management (Admin only)
  static async getRoles(): Promise<Role[]> {
    return apiService.get<Role[]>('/roles');
  }

  static async createRole(data: { name: string; description?: string; permissions: string[] }): Promise<ApiResponse<Role>> {
    return apiService.post<ApiResponse<Role>>('/roles', data);
  }

  static async updateRole(roleId: string, data: { name?: string; description?: string; permissions?: string[] }): Promise<ApiResponse<Role>> {
    return apiService.put<ApiResponse<Role>>(`/roles/${roleId}`, data);
  }

  static async deleteRole(roleId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete<ApiResponse<{ message: string }>>(`/roles/${roleId}`);
  }

  // Permission Management (Admin only)
  static async getPermissions(): Promise<Permission[]> {
    return apiService.get<Permission[]>('/permissions');
  }

  static async createPermission(data: { name: string; description?: string; resource: string; action: string }): Promise<ApiResponse<Permission>> {
    return apiService.post<ApiResponse<Permission>>('/permissions', data);
  }

  static async updatePermission(permissionId: string, data: { name?: string; description?: string; resource?: string; action?: string }): Promise<ApiResponse<Permission>> {
    return apiService.put<ApiResponse<Permission>>(`/permissions/${permissionId}`, data);
  }

  static async deletePermission(permissionId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete<ApiResponse<{ message: string }>>(`/permissions/${permissionId}`);
  }

  // Utility Methods
  static async validateToken(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch {
      return false;
    }
  }

  static async getCurrentUserPermissions(): Promise<string[]> {
    try {
      const user = await this.getProfile();
      return user.permissions;
    } catch {
      return [];
    }
  }

  static async getCurrentUserRoles(): Promise<string[]> {
    try {
      const user = await this.getProfile();
      return user.roles;
    } catch {
      return [];
    }
  }
}

export default AuthService;
