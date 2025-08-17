import { IsString, IsEmail, IsOptional, Length } from 'class-validator';

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  @Length(2, 255)
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Length(10, 20)
  phone?: string;
}
