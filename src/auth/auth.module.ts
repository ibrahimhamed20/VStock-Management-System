import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuditLog } from './entities/audit-log.entity';
import { User } from '../users/entities/user.entity';
import { UserLoginHistory } from '../users/entities/user-login-history.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { MailerService } from '../common/services/mailer.service';
import { Role } from '../users/entities/role.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([AuditLog, User, UserLoginHistory, PasswordResetToken, Role]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard, MailerService],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
