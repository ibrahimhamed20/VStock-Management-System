import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsPositive,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { PaymentMethod } from '../interfaces/invoice.interface';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  reference?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
