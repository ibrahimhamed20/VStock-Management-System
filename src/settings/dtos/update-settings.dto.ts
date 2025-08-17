import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  fiscalYear?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  taxRate?: number;
}
