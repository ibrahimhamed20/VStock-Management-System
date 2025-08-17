import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { AssignRoleDto } from '../dtos/assign-role.dto';
import { UserRole } from '../../auth/interfaces/auth-payload.interface';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    createUser: jest.fn(),
    findAllUsers: jest.fn(),
    findUserById: jest.fn(),
    findUserByUsername: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    assignRole: jest.fn(),
    recordLogin: jest.fn(),
    getLoginHistory: jest.fn(),
    getUsersByRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      role: UserRole.CASHIER,
    };

    it('should create a new user', async () => {
      const mockUser = {
        id: 'user-id',
        ...createUserDto,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.createUser.mockResolvedValue(mockUser);

      const result = await controller.createUser(createUserDto);

      expect(service.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should handle service errors', async () => {
      mockUsersService.createUser.mockRejectedValue(
        new ConflictException('User already exists'),
      );

      await expect(controller.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          username: 'user1',
          email: 'user1@example.com',
          role: UserRole.CASHIER,
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          username: 'user2',
          email: 'user2@example.com',
          role: UserRole.ADMIN,
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUsersService.findAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.findAllUsers();

      expect(service.findAllUsers).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUsersByRole', () => {
    it('should return users by role', async () => {
      const mockUsers = [
        {
          id: 'admin-1',
          username: 'admin1',
          email: 'admin1@example.com',
          role: UserRole.ADMIN,
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUsersService.getUsersByRole.mockResolvedValue(mockUsers);

      const result = await controller.getUsersByRole(UserRole.ADMIN);

      expect(service.getUsersByRole).toHaveBeenCalledWith(UserRole.ADMIN);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findUserById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.CASHIER,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findUserById.mockResolvedValue(mockUser);

      const result = await controller.findUserById('user-id');

      expect(service.findUserById).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockUser);
    });

    it('should handle user not found', async () => {
      mockUsersService.findUserById.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.findUserById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findUserByUsername', () => {
    it('should return user by username', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.CASHIER,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findUserByUsername.mockResolvedValue(mockUser);

      const result = await controller.findUserByUsername('testuser');

      expect(service.findUserByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      role: UserRole.ADMIN,
    };

    it('should update user successfully', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'updated@example.com',
        role: UserRole.ADMIN,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.updateUser.mockResolvedValue(mockUser);

      const result = await controller.updateUser('user-id', updateUserDto);

      expect(service.updateUser).toHaveBeenCalledWith('user-id', updateUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockUsersService.deleteUser.mockResolvedValue(undefined);

      const result = await controller.deleteUser('user-id');

      expect(service.deleteUser).toHaveBeenCalledWith('user-id');
      expect(result).toEqual({ message: 'User deleted successfully' });
    });
  });

  describe('assignRole', () => {
    const assignRoleDto: AssignRoleDto = {
      userId: 'user-id',
      role: UserRole.ADMIN,
    };

    it('should assign role successfully', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.ADMIN,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.assignRole.mockResolvedValue(mockUser);

      const result = await controller.assignRole(assignRoleDto);

      expect(service.assignRole).toHaveBeenCalledWith(assignRoleDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getLoginHistory', () => {
    it('should return login history for user', async () => {
      const mockLoginHistory = [
        {
          id: 'history-1',
          userId: 'user-id',
          loginAt: new Date('2023-01-01'),
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
        {
          id: 'history-2',
          userId: 'user-id',
          loginAt: new Date('2023-01-02'),
          ipAddress: '192.168.1.2',
          userAgent: 'Chrome/90.0',
        },
      ];

      mockUsersService.getLoginHistory.mockResolvedValue(mockLoginHistory);

      const result = await controller.getLoginHistory('user-id');

      expect(service.getLoginHistory).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockLoginHistory);
    });
  });

  describe('recordLogin', () => {
    it('should record login successfully', async () => {
      const mockRequest = {
        user: { userId: 'user-id' },
      };

      const loginData = {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      mockUsersService.recordLogin.mockResolvedValue(undefined);

      const result = await controller.recordLogin(mockRequest, loginData);

      expect(service.recordLogin).toHaveBeenCalledWith(
        'user-id',
        '192.168.1.1',
        'Mozilla/5.0',
      );
      expect(result).toEqual({ message: 'Login recorded successfully' });
    });
  });

  describe('getMyProfile', () => {
    it('should return current user profile', async () => {
      const mockRequest = {
        user: { userId: 'user-id' },
      };

      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.CASHIER,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findUserById.mockResolvedValue(mockUser);

      const result = await controller.getMyProfile(mockRequest);

      expect(service.findUserById).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateMyProfile', () => {
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
    };

    it('should update current user profile', async () => {
      const mockRequest = {
        user: { userId: 'user-id' },
      };

      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'updated@example.com',
        role: UserRole.CASHIER,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.updateUser.mockResolvedValue(mockUser);

      const result = await controller.updateMyProfile(
        mockRequest,
        updateUserDto,
      );

      expect(service.updateUser).toHaveBeenCalledWith('user-id', updateUserDto);
      expect(result).toEqual(mockUser);
    });
  });
});
