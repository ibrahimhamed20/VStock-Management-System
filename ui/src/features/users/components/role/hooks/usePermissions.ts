import { useQuery } from '@tanstack/react-query';
import { RoleService } from '../services/roleService';

export const PERMISSIONS_QUERY_KEY = 'permissions';

export const usePermissions = () => {
  return useQuery({
    queryKey: [PERMISSIONS_QUERY_KEY],
    queryFn: RoleService.getPermissions,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const usePermissionsTreeData = () => {
  const { data: permissions } = usePermissions();
  
  if (!permissions) return [];
  
  // Group permissions by group name (extract from permission name format: groupname.permissionname)
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const [group] = permission.name.split('.');
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  return Object.entries(groupedPermissions).map(([group, perms]) => ({
    title: `${group} Permissions (${perms.length})`,
    key: `group-${group}`,
    value: `group-${group}`,
    action: group,
    children: perms.map(permission => {
      const [, action] = permission.name.split('.');
      return {
        name: `${action || permission.name}${permission.description ? ` - ${permission.description}` : ''}${permission.action ? ` (${permission.action})` : ''}`,
        key: permission.name,
        value: permission.name,
        description: permission.description,
        action: permission.action,
        isLeaf: true,
      };
    }),
  }));
};


