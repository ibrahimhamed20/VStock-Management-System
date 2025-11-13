import { IsDateString, IsOptional } from 'class-validator';

export class FinancialReportsQueryDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

