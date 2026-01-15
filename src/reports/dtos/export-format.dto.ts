import { IsIn, IsOptional } from 'class-validator';

export class ExportFormatDto {
  @IsOptional()
  @IsIn(['pdf', 'excel', 'csv'])
  format?: 'pdf' | 'excel' | 'csv';
}

