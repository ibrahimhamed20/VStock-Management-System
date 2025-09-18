// User types that match the backend interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  status: 'pending' | 'active' | 'rejected' | 'blocked';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  username: string;
  email: string;
  roles: string[];
}

export interface UpdateUserData {
  email?: string;
  roles?: string[];
  status?: 'pending' | 'active' | 'rejected' | 'blocked';
}

export interface AssignRoleData {
  userId: string;
  roles: string[];
}

export interface UserLoginHistory {
  id: string;
  userId: string;
  loginAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  blockedUsers: number;
  pendingUsers: number;
}

export interface UserFilters {
  search?: string;
  status?: string;
  role?: string;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
}
