// Main component
export { PermissionMatrix } from './PermissionMatrix';

// Components
export { PermissionMatrixStats } from './components/PermissionMatrixStats';
export { PermissionMatrixTable } from './components/PermissionMatrixTable';
export { PermissionMatrixLegend } from './components/PermissionMatrixLegend';

// Hooks
export { usePermissionMatrix, usePermissionMatrixStats } from './hooks/usePermissionMatrix';

// Services
export { PermissionMatrixService } from './services/permissionMatrixService';

// Types
export type {
  PermissionMatrixRole,
  PermissionMatrixPermission,
  PermissionMatrixData,
  PermissionMatrixStats,
} from './types/permission-matrix.types';
