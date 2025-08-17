export interface IUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
  status: 'pending' | 'active' | 'rejected' | 'blocked';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUser {
  username: string;
  email: string;
  roles: string[];
}

export interface IUpdateUser {
  email?: string;
  roles?: string[];
}

export interface IAssignRole {
  userId: string;
  roles: string[];
}

export interface IUserLoginHistory {
  id: string;
  userId: string;
  loginAt: Date;
  ipAddress?: string;
  userAgent?: string;
}
