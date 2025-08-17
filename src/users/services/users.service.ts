import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserLoginHistory } from '../entities/user-login-history.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { AssignRoleDto } from '../dtos/assign-role.dto';
import { IUser, IUserLoginHistory } from '../interfaces/user.interface';
import { MailerService } from '../../common/services/mailer.service';
import { Role } from '../entities/role.entity';
import { IPagination } from '../../common/interfaces/pagination.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cacheable } from '../../common/decorators/cacheable.decorator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserLoginHistory)
    private readonly loginHistoryRepository: Repository<UserLoginHistory>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly mailerService: MailerService,
    @Inject(CACHE_MANAGER) public cacheManager: Cache, // must be public for decorator
  ) { }

  async createUser(createUserDto: CreateUserDto): Promise<IUser> {
    const { username, email, roles: roleNames, password } = createUserDto;
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }
    // Fetch roles
    const roles = await this.roleRepository.find({
      where: roleNames.map(name => ({ name })),
    });
    if (roles.length !== roleNames.length) {
      throw new NotFoundException('One or more roles not found');
    }

    const user = this.userRepository.create({
      username,
      email,
      password,
      roles,
    });
    const savedUser = await this.userRepository.save(user);
    return {
      id: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
      roles: savedUser.roles.map(r => r.name),
      status: savedUser.status,
      lastLogin: savedUser.lastLogin,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }

  @Cacheable(120)
  async findAllUsers(page = 1, pageSize = 10): Promise<IPagination<IUser>> {
    const [users, total] = await this.userRepository.findAndCount({
      relations: ['roles'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      data: users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles.map(r => r.name),
        status: user.status,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  @Cacheable(120)
  async findUserById(id: string): Promise<IUser> {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['roles'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles.map(r => r.name),
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findUserByUsername(username: string): Promise<IUser> {
    const user = await this.userRepository.findOne({ where: { username }, relations: ['roles'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles.map(r => r.name),
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<IUser> {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['roles'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }
    if (updateUserDto.roles) {
      const roles = await this.roleRepository.find({
        where: updateUserDto.roles.map(name => ({ name })),
      });
      if (roles.length !== updateUserDto.roles.length) {
        throw new NotFoundException('One or more roles not found');
      }
      user.roles = roles;
    }
    Object.assign(user, { ...updateUserDto, roles: user.roles });
    const updatedUser = await this.userRepository.save(user);
    return {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      roles: updatedUser.roles.map(r => r.name),
      status: updatedUser.status,
      lastLogin: updatedUser.lastLogin,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);
  }

  async assignRole(assignRoleDto: AssignRoleDto): Promise<IUser> {
    const { userId, roles: roleNames } = assignRoleDto;
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['roles'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const oldRoles = user.roles.map(r => r.name);
    const oldStatus = user.status;

    if (roleNames && roleNames.length) {
      const roles = await this.roleRepository.find({
        where: roleNames.map(name => ({ name })),
      });
      if (roles.length !== roleNames.length) {
        throw new NotFoundException('One or more roles not found');
      }
      user.roles = roles;
    }

    const updatedUser = await this.userRepository.save(user);
    // Send email notifications (example: if user is promoted to admin)
    if (oldStatus !== 'active' && updatedUser.status === 'active') {
      await this.mailerService.sendApprovalEmail(updatedUser.email, updatedUser.username);
    } else if (oldStatus !== 'rejected' && updatedUser.status === 'rejected') {
      await this.mailerService.sendRejectionEmail(updatedUser.email, updatedUser.username);
    }
    if (!oldRoles.includes('admin') && updatedUser.roles.some(r => r.name === 'admin')) {
      await this.mailerService.sendPromotionEmail(updatedUser.email, updatedUser.username);
    }
    return {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      roles: updatedUser.roles.map(r => r.name),
      status: updatedUser.status,
      lastLogin: updatedUser.lastLogin,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async recordLogin(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Record login history
    const loginHistory = this.loginHistoryRepository.create({
      userId,
      ipAddress,
      userAgent,
    });

    await this.loginHistoryRepository.save(loginHistory);
  }

  async getLoginHistory(userId: string): Promise<IUserLoginHistory[]> {
    const loginHistory = await this.loginHistoryRepository.find({
      where: { userId },
      order: { loginAt: 'DESC' },
    });

    return loginHistory.map((history) => ({
      id: history.id,
      userId: history.userId,
      loginAt: history.loginAt,
      ipAddress: history.ipAddress,
      userAgent: history.userAgent,
    }));
  }

  async getUsersByRole(role: string): Promise<IUser[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('role.name = :role', { role })
      .orderBy('user.createdAt', 'DESC')
      .getMany();
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles.map(r => r.name),
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  async getUsersByStatus(status: 'pending' | 'active' | 'rejected'): Promise<IUser[]> {
    const users = await this.userRepository.find({ where: { status }, order: { createdAt: 'DESC' } });
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles.map(r => r.name),
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
}
