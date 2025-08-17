import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LlmService } from '../services/llm.service';
import { VectorStoreModule } from './vector-store.module';
import { EnhancedSearchService } from '../services/enhanced-search.service';

@Module({
  imports: [ConfigModule, VectorStoreModule],
  providers: [LlmService, EnhancedSearchService],
  exports: [LlmService, EnhancedSearchService],
})
export class LlmModule {} 