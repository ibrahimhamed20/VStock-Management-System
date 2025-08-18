export interface RoleStats {
  totalRoles: number;
  adminRoles: number;
  customRoles: number;
  totalPermissions: number;
}

export interface RoleFilters {
  searchText: string;
  permissionGroup?: string;
  roleType?: 'admin' | 'custom' | 'all';
}
