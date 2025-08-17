import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/interfaces/auth-payload.interface';
import { Permission } from '../entities/permission.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() body: CreateRoleDto) {
    return this.roleService.createRole(body.name, body.description);
  }

  @Get()
  findAll() {
    return this.roleService.findAllRoles();
  }

  @Get('permission-matrix')
  async getPermissionMatrix() {
    const roles = await this.roleService.findAllRoles();
    const permissions = await this.roleService.getAllPermissions();
    return {
      roles: roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions ? role.permissions.map((p: Permission) => p.name) : [],
      })),
      permissions: permissions.map(p => ({ id: p.id, name: p.name, description: p.description })),
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findRoleById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.roleService.updateRole(id, body.name, body.description);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.deleteRole(id);
  }

  @Post(':id/users')
  assignUser(@Param('id') id: string, @Body() body: { userIds: string[] }) {
    return this.roleService.assignUsersToRole(id, body.userIds);
  }

  @Delete(':id/users/:userId')
  removeUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.roleService.removeUserFromRole(id, userId);
  }

  @Post(':id/permissions')
  assignPermission(@Param('id') id: string, @Body() body: { permissionIds: string[] }) {
    return this.roleService.assignPermissionsToRole(id, body.permissionIds);
  }

  @Delete(':id/permissions/:permissionId')
  removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
    return this.roleService.removePermissionFromRole(id, permissionId);
  }
} 