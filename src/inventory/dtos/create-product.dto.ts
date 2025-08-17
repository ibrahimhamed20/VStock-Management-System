import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  IsPositive,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  unitCost: number;

  @IsNumber()
  @IsPositive()
  sellingPrice: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  minStock: number;

  @IsNumber()
  @Min(0)
  maxStock: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  supplier?: string;
}
