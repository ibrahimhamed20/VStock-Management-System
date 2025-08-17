import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { PasswordResetRequestDto } from './dtos/password-reset-request.dto';
import { PasswordResetDto } from './dtos/password-reset.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import { UserRole } from './interfaces/auth-payload.interface';
import {
  ILoginResponse,
  IRegisterResponse,
} from './interfaces/auth-payload.interface';
import { AuditLog } from './entities/audit-log.entity';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ILoginResponse> { // Return type is now any to include refreshToken
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await this.authService.login(loginDto, ipAddress, userAgent);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true, // set to true in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    // Return the full result, including refreshToken
    return result;
  }

  @Public()
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Request() req: any,
  ): Promise<IRegisterResponse> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return await this.authService.register(registerDto, ipAddress, userAgent);
  }

  @Public()
  @Post('password-reset-request')
  async requestPasswordReset(
    @Body() passwordResetRequestDto: PasswordResetRequestDto,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return await this.authService.requestPasswordReset(
      passwordResetRequestDto,
      ipAddress,
      userAgent,
    );
  }

  @Public()
  @Post('password-reset')
  async resetPassword(
    @Body() passwordResetDto: PasswordResetDto,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return await this.authService.resetPassword(
      passwordResetDto,
      ipAddress,
      userAgent,
    );
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new UnauthorizedException('No refresh token');
    let payload: any;
    try {
      payload = this.authService['jwtService'].verify(refreshToken, { secret: this.authService['configService'].get('JWT_SECRET') });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const tokens = await this.authService.refreshTokens(payload.userId, refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.userId);
    res.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('audit-logs')
  async getAuditLogs(@Request() req: any): Promise<AuditLog[]> {
    const userId = req.query.userId;
    const limit = parseInt(req.query.limit) || 100;

    return await this.authService.getAuditLogs(userId, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return {
      userId: req.user.userId,
      username: req.user.username,
      role: req.user.role,
    };
  }
}
