import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { AssignRoleDto } from '../dtos/assign-role.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/interfaces/auth-payload.interface';
import { IUser, IUserLoginHistory } from '../interfaces/user.interface';
import { IPagination } from '../../common/interfaces/pagination.interface';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<IUser> {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAllUsers(): Promise<IPagination<IUser>> {
    return this.usersService.findAllUsers();
  }

  @Get('by-role/:role')
  @Roles(UserRole.ADMIN)
  async getUsersByRole(@Param('role') role: string): Promise<IUser[]> {
    return this.usersService.getUsersByRole(role);
  }

  @Get('by-status/:status')
  @Roles(UserRole.ADMIN)
  async getUsersByStatus(@Param('status') status: 'pending' | 'active' | 'rejected'): Promise<IUser[]> {
    return this.usersService.getUsersByStatus(status);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findUserById(@Param('id') id: string): Promise<IUser> {
    return this.usersService.findUserById(id);
  }

  @Get('username/:username')
  @Roles(UserRole.ADMIN)
  async findUserByUsername(
    @Param('username') username: string,
  ): Promise<IUser> {
    return this.usersService.findUserByUsername(username);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<IUser> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updateUserStatus(
    @Param('id') id: string,
    @Body() body: Pick<UpdateUserDto, 'status'>
  ) {
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }

  @Post('assign-role')
  @Roles(UserRole.ADMIN)
  async assignRole(@Body() assignRoleDto: AssignRoleDto): Promise<IUser> {
    return this.usersService.assignRole(assignRoleDto);
  }

  @Get(':id/login-history')
  @Roles(UserRole.ADMIN)
  async getLoginHistory(
    @Param('id') userId: string,
  ): Promise<IUserLoginHistory[]> {
    return this.usersService.getLoginHistory(userId);
  }

  @Post('record-login')
  async recordLogin(
    @Request() req,
    @Body() body: { ipAddress?: string; userAgent?: string },
  ): Promise<{ message: string }> {
    await this.usersService.recordLogin(
      req.user.userId,
      body.ipAddress,
      body.userAgent,
    );
    return { message: 'Login recorded successfully' };
  }

  @Get('profile/me')
  async getMyProfile(@Request() req): Promise<IUser> {
    return this.usersService.findUserById(req.user.userId);
  }

  @Put('profile/me')
  async updateMyProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<IUser> {
    return this.usersService.updateUser(req.user.userId, updateUserDto);
  }
}
