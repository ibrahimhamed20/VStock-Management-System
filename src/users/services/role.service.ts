import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) { }

  async createRole(name: string, description?: string): Promise<Role> {
    const role = this.roleRepository.create({ name, description });
    return this.roleRepository.save(role);
  }

  async findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({ relations: ['permissions', 'users'] });
  }

  async findRoleById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id }, relations: ['permissions', 'users'] });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async updateRole(id: string, name: string, description?: string): Promise<Role> {
    const role = await this.findRoleById(id);
    role.name = name;
    if (description !== undefined) {
      role.description = description;
    }
    return this.roleRepository.save(role);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.findRoleById(id);
    await this.roleRepository.remove(role);
  }

  async assignUsersToRole(roleId: string, userIds: string[]): Promise<Role> {
    const role = await this.findRoleById(roleId);

    // Fetch only the users to assign
    const usersToAssign = await this.userRepository.find({ where: userIds.map(id => ({ id })), relations: ['roles'] });

    if (usersToAssign.length !== userIds.length) {
      throw new NotFoundException('One or more users not found');
    }

    // Remove the role from all users who currently have it but are not in the new list
    const usersWithRole = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('role.id = :roleId', { roleId })
      .getMany();

    for (const user of usersWithRole) {
      if (!userIds.includes(user.id)) {
        user.roles = user.roles.filter(r => r.id !== role.id);
        await this.userRepository.save(user);
      }
    }

    // Assign the role to users in the new list (if not already present)
    for (const user of usersToAssign) {
      if (!user.roles.some(r => r.id === role.id)) {
        user.roles.push(role);
        await this.userRepository.save(user);
      }
    }

    return this.findRoleById(roleId);
  }

  async removeUserFromRole(roleId: string, userId: string): Promise<Role> {
    const role = await this.findRoleById(roleId);
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['roles'] });
    if (!user) throw new NotFoundException('User not found');
    user.roles = (user.roles || []).filter(r => r.id !== roleId);
    await this.userRepository.save(user);
    return this.findRoleById(roleId);
  }

  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<Role> {
    const role = await this.findRoleById(roleId);

    // Fetch only the permissions to assign
    const permissions = await this.permissionRepository.find({ where: permissionIds.map(id => ({ id })) });

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    // Assign only the selected permissions
    role.permissions = permissions;
    await this.roleRepository.save(role);
    return this.findRoleById(roleId);
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.findRoleById(roleId);
    role.permissions = (role.permissions || []).filter(p => p.id !== permissionId);
    await this.roleRepository.save(role);
    return this.findRoleById(roleId);
  }

  async getAllPermissions() {
    return this.permissionRepository.find();
  }
} 