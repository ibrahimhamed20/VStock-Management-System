import { IsEmail, IsOptional, IsArray, IsString, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];

  @IsOptional()
  @IsIn(['pending', 'active', 'rejected', 'blocked'])
  status?: 'pending' | 'active' | 'rejected' | 'blocked';
}
