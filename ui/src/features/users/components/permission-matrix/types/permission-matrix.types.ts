export interface PermissionMatrixRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface PermissionMatrixPermission {
  id: string;
  name: string;
  description: string;
}

export interface PermissionMatrixData {
  roles: PermissionMatrixRole[];
  permissions: PermissionMatrixPermission[];
}

export interface PermissionMatrixStats {
  totalRoles: number;
  totalPermissions: number;
  totalAssignments: number;
  averagePermissionsPerRole: number;
}
