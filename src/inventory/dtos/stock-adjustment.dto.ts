import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  IsIn,
  MaxLength,
} from 'class-validator';

export class StockAdjustmentDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason: string;

  @IsString()
  @IsIn(['IN', 'OUT'])
  type: 'IN' | 'OUT';

  @IsString()
  @IsOptional()
  @MaxLength(100)
  reference?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  batchId?: string;
}
