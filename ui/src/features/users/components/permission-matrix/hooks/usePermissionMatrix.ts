import { useQuery } from '@tanstack/react-query';
import { PermissionMatrixService } from '../services/permissionMatrixService';
import type { PermissionMatrixStats } from '../types/permission-matrix.types';

export const PERMISSION_MATRIX_QUERY_KEY = ['permission-matrix'] as const;

export const usePermissionMatrix = () => {
  return useQuery({
    queryKey: PERMISSION_MATRIX_QUERY_KEY,
    queryFn: PermissionMatrixService.getPermissionMatrix
  });
};

export const usePermissionMatrixStats = (): PermissionMatrixStats | null => {
  const { data: permissionMatrix } = usePermissionMatrix();
  
  if (!permissionMatrix) {
    return null;
  }
  
  const totalAssignments = permissionMatrix.roles.reduce(
    (total, role) => total + role.permissions.length, 
    0
  );
  
  return {
    totalRoles: permissionMatrix.roles.length,
    totalPermissions: permissionMatrix.permissions.length,
    totalAssignments,
    averagePermissionsPerRole: permissionMatrix.roles.length > 0 
      ? Number((totalAssignments / permissionMatrix.roles.length).toFixed(1))
      : 0,
  };
};
