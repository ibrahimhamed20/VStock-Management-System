import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  MaxLength,
  IsPositive,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  unitCost?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  sellingPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minStock?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxStock?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  supplier?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
