import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ReportFilterDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  fiscalYear?: string;
}
