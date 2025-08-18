import { useQuery } from '@tanstack/react-query';
import { RoleService } from '../services/roleService';

export const ROLES_QUERY_KEY = 'roles';

export const useRoles = () => {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY],
    queryFn: RoleService.getRoles,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRoleById = (roleId: string) => {
  const { data: roles } = useRoles();
  return roles?.find(role => role.id === roleId);
};

export const useRolesStats = () => {
  const { data: roles } = useRoles();
  
  if (!roles) return null;
  
  return {
    totalRoles: roles.length,
    adminRoles: roles.filter(r => r.name.includes('admin')).length,
    customRoles: roles.filter(r => !r.name.includes('admin')).length,
  };
};
