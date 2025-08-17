import { IsString, IsEmail, IsNotEmpty, Length, IsEnum, IsArray, ArrayNotEmpty } from 'class-validator';
import { UserRole } from '../../auth/interfaces/auth-payload.interface';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 100)
  password: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roles: string[];
}
