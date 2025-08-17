import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async createPermission(name: string, description?: string): Promise<Permission> {
    const permission = this.permissionRepository.create({ name, description });
    return this.permissionRepository.save(permission);
  }

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({ relations: ['roles'] });
  }

  async findPermissionById(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({ where: { id }, relations: ['roles'] });
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async updatePermission(id: string, name: string, description?: string): Promise<Permission> {
    const permission = await this.findPermissionById(id);
    permission.name = name;
    if (description !== undefined) {
      permission.description = description;
    }
    return this.permissionRepository.save(permission);
  }

  async deletePermission(id: string): Promise<void> {
    const permission = await this.findPermissionById(id);
    await this.permissionRepository.remove(permission);
  }
} 