import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleService } from '../services/roleService';
import type { CreateRoleData, UpdateRoleData } from '@auth/types';

export const useRoleOperations = () => {
  const queryClient = useQueryClient();

  // Create Role Mutation
  const createRoleMutation = useMutation({
    mutationFn: (roleData: CreateRoleData) => RoleService.createRole(roleData),
    onSuccess: () => {
      // Invalidate and refetch roles list
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      // Invalidate roles stats
      queryClient.invalidateQueries({ queryKey: ['roles-stats'] });
    },
  });

  // Update Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, roleData }: { id: string; roleData: UpdateRoleData }) =>
      RoleService.updateRole(id, roleData),
    onSuccess: (updatedRole) => {
      // Invalidate and refetch roles list
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      // Invalidate roles stats
      queryClient.invalidateQueries({ queryKey: ['roles-stats'] });
      // Update specific role in cache if needed
      queryClient.setQueryData(['role', updatedRole.id], updatedRole);
    },
  });

  // Delete Role Mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => RoleService.deleteRole(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch roles list
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      // Invalidate roles stats
      queryClient.invalidateQueries({ queryKey: ['roles-stats'] });
      // Remove deleted role from cache
      queryClient.removeQueries({ queryKey: ['role', deletedId] });
    },
  });

  return {
    // Mutation functions
    createRole: createRoleMutation.mutateAsync,
    updateRole: updateRoleMutation.mutateAsync,
    deleteRole: deleteRoleMutation.mutateAsync,

    // Loading states
    isCreating: createRoleMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isDeleting: deleteRoleMutation.isPending,

    // Mutation states
    createRoleMutation,
    updateRoleMutation,
    deleteRoleMutation,
  };
};

// Alternative: Hook for a specific role with all operations
export const useRoleOperationsById = (roleId: string | null) => {
  const queryClient = useQueryClient();

  const createRoleMutation = useMutation({
    mutationFn: (roleData: CreateRoleData) => RoleService.createRole(roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles-stats'] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: (roleData: UpdateRoleData) => {
      if (!roleId) throw new Error('Role ID is required for update');
      return RoleService.updateRole(roleId, roleData);
    },
    onSuccess: (updatedRole) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles-stats'] });
      queryClient.setQueryData(['role', roleId], updatedRole);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: () => {
      if (!roleId) throw new Error('Role ID is required for delete');
      return RoleService.deleteRole(roleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles-stats'] });
    },
  });

  return {
    // Mutation functions
    createRole: createRoleMutation.mutateAsync,
    updateRole: updateRoleMutation.mutateAsync,
    deleteRole: deleteRoleMutation.mutateAsync,

    // Loading states
    isCreating: createRoleMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isDeleting: deleteRoleMutation.isPending,

    // Mutation states
    createRoleMutation,
    updateRoleMutation,
    deleteRoleMutation,
  };
};

// Legacy exports for backward compatibility
export const useCreateRole = () => useRoleOperations().createRoleMutation;
export const useUpdateRole = () => useRoleOperations().updateRoleMutation;
export const useDeleteRole = () => useRoleOperations().deleteRoleMutation;
