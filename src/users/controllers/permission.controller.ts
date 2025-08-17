import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/interfaces/auth-payload.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  create(@Body() body: CreatePermissionDto) {
    return this.permissionService.createPermission(body.name, body.description);
  }

  @Get()
  findAll() {
    return this.permissionService.findAllPermissions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionService.findPermissionById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdatePermissionDto) {
    return this.permissionService.updatePermission(id, body.name, body.description);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionService.deletePermission(id);
  }
} 