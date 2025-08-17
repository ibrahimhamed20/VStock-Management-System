import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { PasswordResetRequestDto } from '../dtos/password-reset-request.dto';
import { PasswordResetDto } from '../dtos/password-reset.dto';
import { UserRole } from '../interfaces/auth-payload.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    getAuditLogs: jest.fn(),
  };

  const mockRequest = {
    ip: '127.0.0.1',
    connection: { remoteAddress: '127.0.0.1' },
    headers: { 'user-agent': 'Mozilla/5.0' },
    user: { userId: '1', username: 'admin', role: UserRole.ADMIN },
    query: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return login response', async () => {
      const loginDto: LoginDto = {
        username: 'admin',
        password: 'password123',
      };

      const expectedResponse = {
        accessToken: 'jwt-token',
        user: {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
        },
      };

      jest.spyOn(service, 'login').mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto, mockRequest);

      expect(service.login).toHaveBeenCalledWith(
        loginDto,
        '127.0.0.1',
        'Mozilla/5.0',
      );
      expect(result).toEqual(expectedResponse);
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

      const expectedResponse = {
        message: 'User registered successfully',
        user: {
          id: '2',
          username: 'newuser',
          email: 'newuser@example.com',
          role: UserRole.CASHIER,
        },
      };

      jest.spyOn(service, 'register').mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto, mockRequest);

      expect(service.register).toHaveBeenCalledWith(
        registerDto,
        '127.0.0.1',
        'Mozilla/5.0',
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('requestPasswordReset', () => {
    it('should return password reset request response', async () => {
      const passwordResetRequestDto: PasswordResetRequestDto = {
        email: 'user@example.com',
      };

      const expectedResponse = {
        message: 'If the email exists, a password reset link has been sent.',
      };

      jest
        .spyOn(service, 'requestPasswordReset')
        .mockResolvedValue(expectedResponse);

      const result = await controller.requestPasswordReset(
        passwordResetRequestDto,
        mockRequest,
      );

      expect(service.requestPasswordReset).toHaveBeenCalledWith(
        passwordResetRequestDto,
        '127.0.0.1',
        'Mozilla/5.0',
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('resetPassword', () => {
    it('should return password reset response', async () => {
      const passwordResetDto: PasswordResetDto = {
        token: 'reset-token',
        newPassword: 'newpassword123',
      };

      const expectedResponse = {
        message: 'Password reset successfully',
      };

      jest.spyOn(service, 'resetPassword').mockResolvedValue(expectedResponse);

      const result = await controller.resetPassword(
        passwordResetDto,
        mockRequest,
      );

      expect(service.resetPassword).toHaveBeenCalledWith(
        passwordResetDto,
        '127.0.0.1',
        'Mozilla/5.0',
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const expectedProfile = {
        userId: '1',
        username: 'admin',
        role: UserRole.ADMIN,
      };

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(expectedProfile);
    });
  });
});
