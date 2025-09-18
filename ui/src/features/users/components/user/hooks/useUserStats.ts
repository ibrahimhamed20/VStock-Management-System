import { useMemo } from 'react';
import { useUsers } from './useUsers';
import type { UserStats } from '../types/user.types';

export const useUserStats = (): { stats: UserStats; isLoading: boolean; error: any } => {
  const { data: users, isLoading, error } = useUsers();

  const stats = useMemo((): UserStats => {
    if (!users) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        blockedUsers: 0,
        pendingUsers: 0,
      };
    }

    return {
      totalUsers: users.length,
      activeUsers: users.filter(user => user.status === 'active').length,
      adminUsers: users.filter(user => user.roles.includes('admin')).length,
      blockedUsers: users.filter(user => user.status === 'blocked').length,
      pendingUsers: users.filter(user => user.status === 'pending').length,
    };
  }, [users]);

  return { stats, isLoading, error };
};
