// User Management Module Exports
export { UserManagement } from './UserManagement';
export { UserStats } from './components/UserStats';
export { UserModal } from './components/UserModal';
export { UserDetailsModal } from './components/UserDetailsModal';

// Hooks
export { useUsers, useUserById, useUserByUsername, useUsersByRole, useUsersByStatus, useUserLoginHistory, useMyProfile } from './hooks/useUsers';
export { useUserOperations, useUserOperationsById } from './hooks/useUserMutations';
export { useUserStats } from './hooks/useUserStats';

// Services
export { UserService } from './services/userService';

// Types
export type { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  AssignRoleData, 
  UserLoginHistory,
  UserStats as UserStatsType,
  UserFilters,
  PaginatedUsers 
} from './types/user.types';
