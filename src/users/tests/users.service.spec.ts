import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';
import { UserLoginHistory } from '../entities/user-login-history.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { AssignRoleDto } from '../dtos/assign-role.dto';
import { UserRole } from '../../auth/interfaces/auth-payload.interface';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let loginHistoryRepository: Repository<UserLoginHistory>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockLoginHistoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserLoginHistory),
          useValue: mockLoginHistoryRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    loginHistoryRepository = module.get<Repository<UserLoginHistory>>(
      getRepositoryToken(UserLoginHistory),
    );
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

    it('should create a new user successfully', async () => {
      const mockUser = {
        id: 'user-id',
        ...createUserDto,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.createUser(createUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [{ username: 'testuser' }, { email: 'test@example.com' }],
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.CASHIER,
        lastLogin: null,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser = { id: 'existing-id', username: 'testuser' };

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
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

      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAllUsers();

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockUsers[0]);
      expect(result[1]).toEqual(mockUsers[1]);
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

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findUserById('user-id');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findUserById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUser', () => {
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      role: UserRole.ADMIN,
    };

    it('should update user successfully', async () => {
      const existingUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'old@example.com',
        role: UserRole.CASHIER,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = { ...existingUser, ...updateUserDto };

      mockUserRepository.findOne
        .mockResolvedValueOnce(existingUser) // First call for finding user
        .mockResolvedValueOnce(null); // Second call for email check
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUser('user-id', updateUserDto);

      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateUser('non-existent', updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'old@example.com',
        role: UserRole.CASHIER,
      };

      const conflictingUser = {
        id: 'other-user-id',
        username: 'otheruser',
        email: 'updated@example.com',
        role: UserRole.CASHIER,
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(conflictingUser);

      await expect(
        service.updateUser('user-id', updateUserDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.CASHIER,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(mockUser);

      await service.deleteUser('user-id');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteUser('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assignRole', () => {
    const assignRoleDto: AssignRoleDto = {
      userId: 'user-id',
      role: UserRole.ADMIN,
    };

    it('should assign role successfully', async () => {
      const existingUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.CASHIER,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = { ...existingUser, role: UserRole.ADMIN };

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.assignRole(assignRoleDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.assignRole(assignRoleDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('recordLogin', () => {
    it('should record login successfully', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.CASHIER,
        lastLogin: null,
      };

      const mockLoginHistory = {
        id: 'history-id',
        userId: 'user-id',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        loginAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockLoginHistoryRepository.create.mockReturnValue(mockLoginHistory);
      mockLoginHistoryRepository.save.mockResolvedValue(mockLoginHistory);

      await service.recordLogin('user-id', '192.168.1.1', 'Mozilla/5.0');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        lastLogin: expect.any(Date),
      });
      expect(mockLoginHistoryRepository.create).toHaveBeenCalledWith({
        userId: 'user-id',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });
      expect(mockLoginHistoryRepository.save).toHaveBeenCalledWith(
        mockLoginHistory,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.recordLogin('non-existent', '192.168.1.1'),
      ).rejects.toThrow(NotFoundException);
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

      mockLoginHistoryRepository.find.mockResolvedValue(mockLoginHistory);

      const result = await service.getLoginHistory('user-id');

      expect(mockLoginHistoryRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        order: { loginAt: 'DESC' },
      });
      expect(result).toEqual(mockLoginHistory);
    });
  });

  describe('getUsersByRole', () => {
    it('should return users by role', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          username: 'admin1',
          email: 'admin1@example.com',
          role: UserRole.ADMIN,
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          username: 'admin2',
          email: 'admin2@example.com',
          role: UserRole.ADMIN,
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.getUsersByRole(UserRole.ADMIN);

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: { role: UserRole.ADMIN },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockUsers);
    });
  });
});
