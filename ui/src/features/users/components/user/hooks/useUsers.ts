import { useQuery } from '@tanstack/react-query';
import { UserService } from '../services/userService';
import type { User, UserLoginHistory } from '../types/user.types';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => UserService.getUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserById = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => UserService.getUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserByUsername = (username: string) => {
  return useQuery({
    queryKey: ['user', 'username', username],
    queryFn: () => UserService.getUserByUsername(username),
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUsersByRole = (role: string) => {
  return useQuery({
    queryKey: ['users', 'role', role],
    queryFn: () => UserService.getUsersByRole(role),
    enabled: !!role,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUsersByStatus = (status: 'pending' | 'active' | 'rejected') => {
  return useQuery({
    queryKey: ['users', 'status', status],
    queryFn: () => UserService.getUsersByStatus(status),
    enabled: !!status,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserLoginHistory = (userId: string) => {
  return useQuery({
    queryKey: ['user', 'login-history', userId],
    queryFn: () => UserService.getLoginHistory(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile', 'me'],
    queryFn: () => UserService.getMyProfile(),
    staleTime: 5 * 60 * 1000,
  });
};
