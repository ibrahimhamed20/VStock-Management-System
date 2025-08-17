import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VectorStoreService } from '../services/vector-store.service';
import { EmbeddingsModule } from './embeddings.module';

@Module({
  imports: [ConfigModule, EmbeddingsModule],
  providers: [VectorStoreService],
  exports: [VectorStoreService],
})
export class VectorStoreModule {} 