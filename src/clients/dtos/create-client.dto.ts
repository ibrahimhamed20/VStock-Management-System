import { IsString, IsEmail, IsNotEmpty, Length } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 20)
  phone: string;
}
