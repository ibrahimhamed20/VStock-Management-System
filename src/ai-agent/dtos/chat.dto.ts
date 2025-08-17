import { Type } from "class-transformer";
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

// DTOs for API validation

export class QueryDto {
    @IsString()
    @IsNotEmpty()
    query: string;

    @IsString()
    @IsOptional()
    conversationId?: string;
}

export class AdvancedSearchDto {
    @IsString()
    @IsNotEmpty()
    query: string;

    @IsArray()
    @IsOptional()
    entityTypes?: string[];

    @IsDateString()
    @IsOptional()
    dateFrom?: string;

    @IsDateString()
    @IsOptional()
    dateTo?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    limit?: number = 15;
}

export interface ChatResponseDto {
    message: string;
    html: string;
    data?: any;
    timestamp: string;
    conversationId?: string;
    searchMetadata?: any;
}
