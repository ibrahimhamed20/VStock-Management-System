import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { User } from './entities/user.entity';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { RoleController } from './controllers/role.controller';
import { PermissionController } from './controllers/permission.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, User])],
  providers: [RoleService, PermissionService],
  controllers: [RoleController, PermissionController],
  exports: [RoleService, PermissionService],
})
export class RolesModule { } 