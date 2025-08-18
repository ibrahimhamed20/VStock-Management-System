import { AuthService } from '@auth/services';
import type { Role, Permission, CreateRoleData, UpdateRoleData } from '@auth/types';

export class RoleService {
  static async getRoles(): Promise<Role[]> {
    try {
      const roles = await AuthService.getRoles();
      return roles || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw new Error('Failed to fetch roles');
    }
  }

  static async getPermissions(): Promise<Permission[]> {
    try {
      const permissions = await AuthService.getPermissions();
      return permissions || [];
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw new Error('Failed to fetch permissions');
    }
  }

  static async createRole(roleData: CreateRoleData): Promise<Role> {
    try {
      const role = await AuthService.createRole(roleData);
      return role.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw new Error('Failed to create role');
    }
  }

  static async updateRole(roleId: string, roleData: UpdateRoleData): Promise<Role> {
    try {
      const role = await AuthService.updateRole(roleId, roleData);
      return role.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw new Error('Failed to update role');
    }
  }

  static async deleteRole(roleId: string): Promise<void> {
    try {
      await AuthService.deleteRole(roleId);
    } catch (error) {
      console.error('Error deleting role:', error);
      throw new Error('Failed to delete role');
    }
  }
}
