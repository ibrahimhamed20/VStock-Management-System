import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  description?: string;
} 