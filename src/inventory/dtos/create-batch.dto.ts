import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  IsPositive,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateBatchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  batchId: string;

  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsDateString()
  expiryDate: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsDateString()
  @IsOptional()
  manufacturingDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  supplier?: string;

  @IsNumber()
  @IsPositive()
  cost: number;
}
