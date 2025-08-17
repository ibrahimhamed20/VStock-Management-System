import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';
import { AuditLog } from '../entities/audit-log.entity';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { PasswordResetRequestDto } from '../dtos/password-reset-request.dto';
import { PasswordResetDto } from '../dtos/password-reset.dto';
import { UserRole } from '../interfaces/auth-payload.interface';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let auditLogRepository: Repository<AuditLog>;

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockAuditLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditLogRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    auditLogRepository = module.get<Repository<AuditLog>>(
      getRepositoryToken(AuditLog),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return login response for valid credentials', async () => {
      const loginDto: LoginDto = {
        username: 'admin',
        password: 'password123',
      };

      const mockPayload = {
        userId: '1',
        username: 'admin',
        role: UserRole.ADMIN,
      };

      const mockAuditLog = {
        id: '1',
        userId: '1',
        username: 'admin',
        userRole: UserRole.ADMIN,
        action: 'LOGIN',
        details: 'User logged in successfully',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(),
      };

      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');
      jest.spyOn(auditLogRepository, 'create').mockReturnValue(mockAuditLog);
      jest.spyOn(auditLogRepository, 'save').mockResolvedValue(mockAuditLog);

      const result = await service.login(loginDto, '127.0.0.1', 'Mozilla/5.0');

      expect(jwtService.sign).toHaveBeenCalledWith(mockPayload);
      expect(auditLogRepository.create).toHaveBeenCalled();
      expect(auditLogRepository.save).toHaveBeenCalled();
      expect(result.accessToken).toBe('jwt-token');
      expect(result.user.username).toBe('admin');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        username: 'wronguser',
        password: 'wrongpassword',
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should return registration response', async () => {
      const registerDto: RegisterDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        role: UserRole.CASHIER,
      };

      const mockAuditLog = {
        id: '1',
        userId: '2',
        username: 'newuser',
        userRole: UserRole.CASHIER,
        action: 'REGISTER',
        details: 'New user registered',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(),
      };

      jest.spyOn(auditLogRepository, 'create').mockReturnValue(mockAuditLog);
      jest.spyOn(auditLogRepository, 'save').mockResolvedValue(mockAuditLog);

      const result = await service.register(
        registerDto,
        '127.0.0.1',
        'Mozilla/5.0',
      );

      expect(auditLogRepository.create).toHaveBeenCalled();
      expect(auditLogRepository.save).toHaveBeenCalled();
      expect(result.message).toBe('User registered successfully');
      expect(result.user.username).toBe('newuser');
    });
  });

  describe('requestPasswordReset', () => {
    it('should return password reset request response', async () => {
      const passwordResetRequestDto: PasswordResetRequestDto = {
        email: 'user@example.com',
      };

      const mockAuditLog = {
        id: '1',
        userId: 'unknown',
        username: 'unknown',
        userRole: UserRole.ADMIN,
        action: 'PASSWORD_RESET_REQUEST',
        details: 'Password reset requested for user@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(),
      };

      jest.spyOn(auditLogRepository, 'create').mockReturnValue(mockAuditLog);
      jest.spyOn(auditLogRepository, 'save').mockResolvedValue(mockAuditLog);

      const result = await service.requestPasswordReset(
        passwordResetRequestDto,
        '127.0.0.1',
        'Mozilla/5.0',
      );

      expect(auditLogRepository.create).toHaveBeenCalled();
      expect(auditLogRepository.save).toHaveBeenCalled();
      expect(result.message).toBe(
        'If the email exists, a password reset link has been sent.',
      );
    });
  });

  describe('getAuditLogs', () => {
    it('should return audit logs', async () => {
      const mockAuditLogs = [
        {
          id: '1',
          userId: '1',
          username: 'admin',
          userRole: UserRole.ADMIN,
          action: 'LOGIN',
          details: 'User logged in',
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          timestamp: new Date(),
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockAuditLogs),
      };

      jest
        .spyOn(auditLogRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.getAuditLogs('1', 50);

      expect(auditLogRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'audit_log.userId = :userId',
        { userId: '1' },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'audit_log.timestamp',
        'DESC',
      );
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(50);
      expect(result).toEqual(mockAuditLogs);
    });
  });
});
