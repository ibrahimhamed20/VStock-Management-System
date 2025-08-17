import { Injectable, UnauthorizedException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { PasswordResetRequestDto } from './dtos/password-reset-request.dto';
import { PasswordResetDto } from './dtos/password-reset.dto';
import { AuditLog } from './entities/audit-log.entity';
import { User } from '../users/entities/user.entity';
import { UserLoginHistory } from '../users/entities/user-login-history.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { randomBytes } from 'crypto';
import { IAuthPayload, ILoginResponse, IRegisterResponse } from './interfaces/auth-payload.interface';
import { MailerService } from '../common/services/mailer.service';
import { Role } from '../users/entities/role.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailerService,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserLoginHistory)
    private userLoginHistoryRepository: Repository<UserLoginHistory>,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

  // LOGIN: by username or email
  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ILoginResponse & { refreshToken: string }> {
    const user = await this.userRepository.findOne({
      where: [
        { username: loginDto.username },
        { email: loginDto.username },
      ],
      relations: ['roles'],
    });
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status === 'blocked') {
      throw new ForbiddenException('Your account is blocked. Please contact an administrator.');
    }
    if (user.status !== 'active') {
      throw new ForbiddenException('Your account is not active. Please contact an administrator.');
    }
    await this.userLoginHistoryRepository.save({
      userId: user.id,
      ipAddress,
      userAgent,
    });
    // Fetch permissions from all roles
    const permissions = user.roles.flatMap(role => (role.permissions ? role.permissions.map(p => p.name) : []));
    // JWT payload
    const payload: IAuthPayload = {
      userId: user.id,
      username: user.username,
      roles: user.roles.map(r => r.name),
      permissions,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m') });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d') });
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.save(user);
    await this.logAuditAction(
      user.id,
      user.username,
      user.roles.map(r => r.name),
      'LOGIN',
      'User logged in successfully',
      ipAddress,
      userAgent,
    );
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles.map(r => r.name),
        permissions,
      },
    };
  }

  // REGISTER: check for existing user, hash password, save
  async register(
    registerDto: RegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<IRegisterResponse> {
    const existing = await this.userRepository.findOne({
      where: [
        { username: registerDto.username },
        { email: registerDto.email },
      ],
    });
    if (existing) {
      throw new ConflictException('Username or email already exists');
    }
    // Prevent self-registration as admin
    if (registerDto.roles && registerDto.roles.includes('admin')) {
      throw new ForbiddenException('Cannot self-register as admin');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    // Fetch roles
    const roles = await this.roleRepository.findByIds(registerDto.roles);
    if (roles.length !== registerDto.roles.length) {
      throw new NotFoundException('One or more roles not found');
    }
    const newUser = this.userRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      roles,
    });
    await this.userRepository.save(newUser);
    await this.logAuditAction(
      newUser.id,
      newUser.username,
      newUser.roles.map(r => r.name),
      'REGISTER',
      'New user registered',
      ipAddress,
      userAgent,
    );
    const permissions = newUser.roles.flatMap(role => (role.permissions ? role.permissions.map(p => p.name) : []));
    return {
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        roles: newUser.roles.map(r => r.name),
        permissions
      },
    };
  }

  // PASSWORD RESET REQUEST: find user, generate token (simulate), log
  async requestPasswordReset(
    passwordResetRequestDto: PasswordResetRequestDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email: passwordResetRequestDto.email } });
    if (!user) {
      // For security, do not reveal if user exists
      return { message: 'If the email exists, a password reset link has been sent.' };
    }
    // Generate a secure random token
    const plainToken = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(plainToken, 10);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry
    // Store the hashed token in the DB
    await this.passwordResetTokenRepository.save({
      userId: user.id,
      token: hashedToken,
      expiresAt,
    });
    // Simulate sending email (in production, send plainToken in email link)
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
    await this.mailerService.sendMail(
      user.email,
      'Password Reset Request',
      `<p>Click <a href="${frontendUrl}/auth/reset-password?token=${plainToken}">here</a> to reset your password. This link will expire in 1 hour.</p>`
    );
    await this.logAuditAction(
      user.id,
      user.username,
      user.roles ? user.roles.map(r => r.name) : [],
      'PASSWORD_RESET_REQUEST',
      `Password reset requested for ${user.email}`,
      ipAddress,
      userAgent,
    );
    // In production, send: `${frontendUrl}/reset-password?token=${plainToken}`
    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  // PASSWORD RESET: validate token (simulate), update password
  async resetPassword(
    passwordResetDto: PasswordResetDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    // 1. Find the reset token entity
    const resetTokenEntity = await this.passwordResetTokenRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });
    // Find by token (hashed) and not expired
    const now = new Date();
    let matchedToken: PasswordResetToken | undefined;
    if (resetTokenEntity) {
      // Compare provided token with stored hash
      const isMatch = await bcrypt.compare(passwordResetDto.token, resetTokenEntity.token);
      if (isMatch && resetTokenEntity.expiresAt > now) {
        matchedToken = resetTokenEntity;
      }
    }
    if (!matchedToken) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
    // 2. Find the user
    const user = await this.userRepository.findOne({ where: { id: matchedToken.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // 3. Update the password
    user.password = await bcrypt.hash(passwordResetDto.newPassword, 10);
    await this.userRepository.save(user);
    // 4. Delete the used token
    await this.passwordResetTokenRepository.delete(matchedToken.id);
    // 5. Log the password reset
    await this.logAuditAction(
      user.id,
      user.username,
      user.roles.map(r => r.name),
      'PASSWORD_RESET',
      'Password reset completed',
      ipAddress,
      userAgent,
    );
    return { message: 'Password reset successfully' };
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user || !user.refreshToken) throw new UnauthorizedException('Access Denied');
    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) throw new UnauthorizedException('Access Denied');
    const permissions = user.roles.flatMap(role => (role.permissions ? role.permissions.map(p => p.name) : []));
    const payload: IAuthPayload = {
      userId: user.id,
      username: user.username,
      roles: user.roles.map(r => r.name),
      permissions
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m') });
    const newRefreshToken = this.jwtService.sign(payload, { expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d') });
    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.userRepository.save(user);
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.refreshToken = undefined;
      await this.userRepository.save(user);
    }
  }

  async getAuditLogs(
    userId?: string,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit_log');

    if (userId) {
      query.where('audit_log.userId = :userId', { userId });
    }

    query.orderBy('audit_log.timestamp', 'DESC').limit(limit);

    return await query.getMany();
  }

  private async logAuditAction(
    userId: string,
    username: string,
    roles: string[],
    action: string,
    details?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      userId,
      username,
      userRoles: roles,
      action,
      details,
      ipAddress,
      userAgent,
    });

    await this.auditLogRepository.save(auditLog);
  }
}
