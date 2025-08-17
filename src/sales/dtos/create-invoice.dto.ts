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

export class InvoiceItemDto {
  @IsString()
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
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;
}

export class CreateInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  taxRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discountAmount?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
