import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class TagClientDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  tags: string[];
}
