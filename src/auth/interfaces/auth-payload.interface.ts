export interface IAuthPayload {
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

export enum UserRole {
  ADMIN = 'admin',
  CASHIER = 'cashier',
  ACCOUNTANT = 'accountant',
  MANAGER = "MANAGER",
}

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
}

export interface IRegisterResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
}
