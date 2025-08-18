export { RoleManagement } from './RoleManagement';
export { RoleStats } from './components/RoleStats';
export { RoleModal } from './components/RoleModal';
export { RoleDetailsModal } from './components/RoleDetailsModal';
export { PermissionSelector } from './components/PermissionSelector';

// Types
export type { Role, Permission, CreateRoleData, UpdateRoleData } from '@auth/types';
export * from './types/role.types';

// Hooks
export { useRoles, useRoleById, useRolesStats } from './hooks/useRoles';
export { usePermissions, usePermissionsTreeData } from './hooks/usePermissions';
export { useRoleOperations, useRoleOperationsById, useCreateRole, useUpdateRole, useDeleteRole } from './hooks/useRoleMutations';

// Services
export { RoleService } from './services/roleService';
