import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsOptional()
  productName?: string;

  @IsString()
  @IsOptional()
  productSku?: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  unitCost: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreatePurchaseDto {
  @IsUUID()
  @IsNotEmpty()
  supplierId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  taxRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  shippingCost?: number;

  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
