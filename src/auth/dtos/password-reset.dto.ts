import { IsString, IsNotEmpty, Length } from 'class-validator';

export class PasswordResetDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  newPassword: string;
}
