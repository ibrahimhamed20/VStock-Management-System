import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { User } from './entities/user.entity';
import { UserLoginHistory } from './entities/user-login-history.entity';
import { MailerService } from '../common/services/mailer.service';
import { Role } from './entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserLoginHistory, Role])],
  controllers: [UsersController],
  providers: [UsersService, MailerService],
  exports: [UsersService],
})
export class UsersModule { }
