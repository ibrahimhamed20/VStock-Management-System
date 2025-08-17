import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class ForecastDto {
  @IsString()
  productId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @IsOptional()
  periods?: number;
}
