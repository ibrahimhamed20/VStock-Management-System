import apiService from '@/features/core/services/api';
import type { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  AssignRoleData, 
  UserLoginHistory,
  PaginatedUsers 
} from '../types/user.types';

export class UserService {
  static async getUsers(): Promise<User[]> {
    try {
      const response = await apiService.get<PaginatedUsers>('/users');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async getUserById(id: string): Promise<User> {
    try {
      const response = await apiService.get<User>(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  static async getUserByUsername(username: string): Promise<User> {
    try {
      const response = await apiService.get<User>(`/users/username/${username}`);
      return response;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw error;
    }
  }

  static async createUser(userData: CreateUserData): Promise<User> {
    try {
      const response = await apiService.post<User>('/users', userData);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    try {
      const response = await apiService.put<User>(`/users/${id}`, userData);
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async updateUserStatus(id: string, status: 'pending' | 'active' | 'rejected' | 'blocked'): Promise<User> {
    try {
      const response = await apiService.patch<User>(`/users/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  static async deleteUser(id: string): Promise<{ message: string }> {
    try {
      const response = await apiService.delete<{ message: string }>(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async assignRole(assignRoleData: AssignRoleData): Promise<User> {
    try {
      const response = await apiService.post<User>('/users/assign-role', assignRoleData);
      return response;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  }

  static async getUsersByRole(role: string): Promise<User[]> {
    try {
      const response = await apiService.get<User[]>(`/users/by-role/${role}`);
      return response;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  static async getUsersByStatus(status: 'pending' | 'active' | 'rejected'): Promise<User[]> {
    try {
      const response = await apiService.get<User[]>(`/users/by-status/${status}`);
      return response;
    } catch (error) {
      console.error('Error fetching users by status:', error);
      throw error;
    }
  }

  static async getLoginHistory(userId: string): Promise<UserLoginHistory[]> {
    try {
      const response = await apiService.get<UserLoginHistory[]>(`/users/${userId}/login-history`);
      return response;
    } catch (error) {
      console.error('Error fetching login history:', error);
      throw error;
    }
  }

  static async getMyProfile(): Promise<User> {
    try {
      const response = await apiService.get<User>('/users/profile/me');
      return response;
    } catch (error) {
      console.error('Error fetching my profile:', error);
      throw error;
    }
  }

  static async updateMyProfile(userData: UpdateUserData): Promise<User> {
    try {
      const response = await apiService.put<User>('/users/profile/me', userData);
      return response;
    } catch (error) {
      console.error('Error updating my profile:', error);
      throw error;
    }
  }
}
