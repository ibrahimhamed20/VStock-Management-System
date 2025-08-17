import { IsString, IsNotEmpty, IsUUID, IsArray } from 'class-validator';

export class AssignRoleDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsArray()
  @IsString({ each: true })
  roles: string[];

}
