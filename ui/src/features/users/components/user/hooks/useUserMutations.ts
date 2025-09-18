import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services/userService';
import type { CreateUserData, UpdateUserData, AssignRoleData } from '../types/user.types';

export const useUserOperations = () => {
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserData) => UserService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUserData }) => 
      UserService.updateUser(id, userData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'pending' | 'active' | 'rejected' | 'blocked' }) => 
      UserService.updateUserStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => UserService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: (assignRoleData: AssignRoleData) => UserService.assignRole(assignRoleData),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });

  const updateMyProfileMutation = useMutation({
    mutationFn: (userData: UpdateUserData) => UserService.updateMyProfile(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile', 'me'] });
    },
  });

  return {
    createUser: createUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    updateUserStatus: updateUserStatusMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    assignRole: assignRoleMutation.mutateAsync,
    updateMyProfile: updateMyProfileMutation.mutateAsync,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isUpdatingStatus: updateUserStatusMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    isAssigningRole: assignRoleMutation.isPending,
    isUpdatingProfile: updateMyProfileMutation.isPending,
  };
};

export const useUserOperationsById = (id: string) => {
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: (userData: UpdateUserData) => UserService.updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: (status: 'pending' | 'active' | 'rejected' | 'blocked') => 
      UserService.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: () => UserService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: (roles: string[]) => UserService.assignRole({ userId: id, roles }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });

  return {
    updateUser: updateUserMutation.mutateAsync,
    updateUserStatus: updateUserStatusMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    assignRole: assignRoleMutation.mutateAsync,
    isUpdating: updateUserMutation.isPending,
    isUpdatingStatus: updateUserStatusMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    isAssigningRole: assignRoleMutation.isPending,
  };
};
