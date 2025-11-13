import {
  IsString,
  IsDateString,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  IsEnum,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class JournalEntryLineDto {
  @IsUUID()
  accountId: string;

  @IsEnum(['debit', 'credit'])
  type: 'debit' | 'credit';

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateJournalEntryDto {
  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineDto)
  @ArrayMinSize(2)
  lines: JournalEntryLineDto[];
}
