import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from 'langchain/document';
import { SystemDataDocument, VectorStoreStats, SearchDocument } from '../interfaces/ai-agent.interface';
import { EmbeddingsService } from './embeddings.service';

@Injectable()
export class VectorStoreService implements OnModuleInit {
  private readonly logger = new Logger(VectorStoreService.name);
  private vectorStore: PGVectorStore;
  private isInitialized = false;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(
    private readonly configService: ConfigService,
    private readonly embeddingsService: EmbeddingsService
  ) {
    // Ensure chunkOverlap is always less than chunkSize
    const chunkSize = this.configService.get<number>('AI_CHUNK_SIZE', 1500);
    const chunkOverlap = Math.min(
      this.configService.get<number>('AI_CHUNK_OVERLAP', 300),
      Math.max(1, Math.floor(chunkSize * 0.2)) // Cap overlap at 20% of chunkSize
    );

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      separators: ['\n\n', '\n', '|', ' ', ''],
    });

    this.logger.log(`Text splitter configured with chunkSize: ${chunkSize}, chunkOverlap: ${chunkOverlap}`);
  }

  async onModuleInit() {
    try {
      this.logger.log('Initializing vector store...');
      await this.initializeVectorStore();
      this.isInitialized = true;
      this.logger.log('Vector store initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize vector store', error);
      throw error;
    }
  }

  private async initializeVectorStore() {
    const connectionString =
      this.configService.get<string>('DATABASE_URL') ||
      `postgresql://${this.configService.get('PG_USER', 'postgres')}:${this.configService.get('PG_PASSWORD', 'root')}@${this.configService.get('PG_HOST', 'localhost')}:${this.configService.get('PG_PORT', '5432')}/${this.configService.get('PG_DATABASE', 'store_management_db')}`;
      
    const embeddings = this.embeddingsService.getEmbeddingsInstance();

    this.vectorStore = await PGVectorStore.initialize(embeddings, {
      postgresConnectionOptions: { connectionString },
      tableName: 'system_data',
      columns: {
        idColumnName: 'id',
        vectorColumnName: 'vector',
        contentColumnName: 'content',
        metadataColumnName: 'metadata',
      },
    });
  }

  async addDocuments(
    docs: SystemDataDocument[],
    entityType: string,
    batchSize = 50
  ): Promise<number> {
    if (!this.vectorStore || docs.length === 0) return 0;

    let totalProcessed = 0;
    const batches = this.chunkArray(docs, batchSize);

    for (const batch of batches) {
      const documentsToAdd: Document[] = [];

      for (const doc of batch) {
        try {
          const cleanContent = doc.content
            .replace(/\u0000/g, '')
            .replace(/\r\n/g, '\n')
            .trim();

          if (!cleanContent) continue;

          const chunks = await this.textSplitter.splitText(cleanContent);

          chunks.forEach((chunk, index) => {
            documentsToAdd.push(
              new Document({
                pageContent: chunk,
                metadata: {
                  ...(doc.metadata || {}),
                  entity_type: entityType,
                  chunk_index: index,
                  document_id: doc.id,
                  content_length: chunk.length,
                  processed_at: new Date().toISOString(),
                },
              })
            );
          });
        } catch (error) {
          this.logger.error(`Error processing document ${doc.id}`, error);
        }
      }

      if (documentsToAdd.length > 0) {
        try {
          await this.vectorStore.addDocuments(documentsToAdd);
          totalProcessed += documentsToAdd.length;
          this.logger.debug(`Processed batch: ${totalProcessed} document chunks`);
        } catch (error) {
          this.logger.error('Error adding batch to vector store', error);
        }
      }
    }

    this.logger.log(`Successfully processed ${totalProcessed} document chunks for ${entityType}`);
    return totalProcessed;
  }

  /**
   * Search for similar content in the vector store
   * @param query Search query
   * @param k Number of results to return
   * @param filter Optional filter criteria
   * @returns Array of similar documents
   */
  async similaritySearch(query: string, k = 15, filter?: any): Promise<SearchDocument[]> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }
    
    try {
      // Enhanced filter processing
      const processedFilter = this.processMetadataFilter(filter);
      
      const results = await this.vectorStore.similaritySearch(query, k, processedFilter);
      
      // Post-process results to add relevance scores
      return results.map((doc, index) => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          relevanceScore: this.calculateRelevanceScore(doc, query, filter),
          searchRank: index + 1
        }
      }));
    } catch (error) {
      this.logger.error('Error in similarity search:', error);
      throw error;
    }
  }

  /**
   * Process metadata filters for enhanced search capabilities
   */
  private processMetadataFilter(filter?: any): any {
    if (!filter) return undefined;

    const processedFilter: any = {};

    // Handle entity type filtering
    if (filter.entity_type) {
      if (Array.isArray(filter.entity_type)) {
        processedFilter.entity_type = { $in: filter.entity_type };
      } else {
        processedFilter.entity_type = filter.entity_type;
      }
    }

    // Handle date range filtering
    if (filter.dateRange || filter.updatedAt) {
      const dateFilter = filter.dateRange || filter.updatedAt;
      if (dateFilter.$gte || dateFilter.$lte) {
        processedFilter.updatedAt = {
          $gte: dateFilter.$gte,
          $lte: dateFilter.$lte
        };
      }
    }

    // Handle custom metadata fields
    Object.entries(filter).forEach(([key, value]) => {
      if (key !== 'entity_type' && key !== 'dateRange' && key !== 'updatedAt') {
        if (Array.isArray(value)) {
          processedFilter[key] = { $in: value };
        } else {
          processedFilter[key] = value;
        }
      }
    });

    return processedFilter;
  }

  /**
   * Calculate relevance score for search results
   */
  private calculateRelevanceScore(doc: any, query: string, filter?: any): number {
    let score = 0.5; // Base score

    // Content relevance (keyword matching)
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = doc.pageContent.toLowerCase().split(/\s+/);
    const contentMatches = queryWords.filter(word => 
      contentWords.some(contentWord => contentWord.includes(word))
    );
    score += (contentMatches.length / queryWords.length) * 0.3;

    // Metadata relevance
    if (filter && doc.metadata) {
      Object.entries(filter).forEach(([key, value]) => {
        if (doc.metadata[key] === value) {
          score += 0.2;
        } else if (Array.isArray(value) && value.includes(doc.metadata[key])) {
          score += 0.2;
        }
      });
    }

    // Recency boost
    if (doc.metadata?.updatedAt) {
      const daysSinceUpdate = (Date.now() - new Date(doc.metadata.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 7) score += 0.1; // Recent documents get a boost
    }

    return Math.min(score, 1.0);
  }

  /**
   * Advanced search with filters and pagination
   * @param query Search query
   * @param filters Optional filters
   * @returns Search results with metadata
   */
  async advancedSearch(
    query: string,
    filters?: {
      entityTypes?: string[];
      dateRange?: { from: Date; to: Date };
      limit?: number;
    }
  ) {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    try {
      const searchOptions: any = {
        k: filters?.limit || 15
      };

      // Apply entity type filter
      if (filters?.entityTypes?.length) {
        searchOptions.filter = {
          entity_type: { $in: filters.entityTypes }
        };
      }

      const docs = await this.vectorStore.similaritySearch(query, searchOptions.k, searchOptions.filter);
      const groupedResults = this.groupSearchResults(docs);

      return {
        query,
        totalResults: docs.length,
        resultsByType: groupedResults,
        facets: this.calculateFacets(docs)
      };
    } catch (error) {
      this.logger.error('Error in advanced search', error);
      throw new Error('Advanced search failed');
    }
  }

  /**
   * Group search results by entity type
   * @private
   */
  private groupSearchResults(docs: SearchDocument[]) {
    return docs.reduce((acc, doc) => {
      const entityType = doc.metadata.entity_type || 'unknown';
      if (!acc[entityType]) acc[entityType] = [];
      acc[entityType].push({
        content: doc.pageContent,
        metadata: doc.metadata,
      });
      return acc;
    }, {} as Record<string, Array<{ content: string; metadata: Record<string, any> }>>);
  }

  /**
   * Calculate facets from search results
   * @private
   */
  private calculateFacets(docs: any[]) {
    const entityTypeCounts: Record<string, number> = {};
    const dateRanges: Record<string, number> = {};

    docs.forEach(doc => {
      const entityType = doc.metadata.entity_type;
      entityTypeCounts[entityType] = (entityTypeCounts[entityType] || 0) + 1;

      const updatedAt = doc.metadata.updatedAt || doc.metadata.last_updated;
      if (updatedAt) {
        const date = new Date(updatedAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        dateRanges[monthKey] = (dateRanges[monthKey] || 0) + 1;
      }
    });

    return {
      entityTypes: entityTypeCounts,
      dateRanges
    };
  }

  async getStats(): Promise<VectorStoreStats> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    // Get basic stats
    const stats: VectorStoreStats = {
      totalDocuments: 0,
      documentsByType: {},
      lastUpdated: new Date(),
      averageVectorDimension: 0,
      memoryUsage: '0 MB',
    };

    // Get document count by type
    const result = await this.vectorStore.pool.query(
      `SELECT 
        metadata->>'entity_type' as entity_type, 
        COUNT(*) as count,
        MAX((metadata->>'processed_at')::timestamp) as last_updated
      FROM system_data 
      GROUP BY metadata->>'entity_type'`
    );

    result.rows.forEach(row => {
      stats.documentsByType[row.entity_type] = parseInt(row.count);
      stats.totalDocuments += parseInt(row.count);

      const lastUpdated = new Date(row.last_updated);
      if (lastUpdated > stats.lastUpdated) {
        stats.lastUpdated = lastUpdated;
      }
    });

    // Get average vector dimension
    const dimResult = await this.vectorStore.pool.query(
      'SELECT AVG(array_length(vector, 1)) as avg_dim FROM system_data LIMIT 1'
    );
    stats.averageVectorDimension = parseFloat(dimResult.rows[0]?.avg_dim || '0');

    // Get memory usage
    const sizeResult = await this.vectorStore.pool.query(
      "SELECT pg_size_pretty(pg_total_relation_size('system_data')) as size"
    );
    stats.memoryUsage = sizeResult.rows[0]?.size || '0 MB';

    return stats;
  }

  /**
   * Clear all documents from the vector store
   * @returns Result of the operation
   */
  async clear(): Promise<{ success: boolean; message: string }> {
    if (!this.vectorStore) throw new Error('Vector store not initialized');

    try {
      // Delete all documents by using a filter that matches all documents
      await this.vectorStore.delete({ filter: {} });

      this.logger.log('Vector store cleared successfully');
      return { success: true, message: 'Vector store cleared successfully' };
    } catch (error) {
      this.logger.error('Failed to clear vector store', error);
      throw new Error(`Failed to clear vector store: ${error.message}`);
    }
  }

  /**
   * Remove documents by entity type (for incremental sync)
   */
  async removeDocumentsByEntityType(entityType: string): Promise<number> {
    if (!this.vectorStore) {
      this.logger.warn('Vector store not initialized, cannot remove documents');
      return 0;
    }

    try {
      // Use vector store instance to delete by entity type filter
      const filter = { entity_type: entityType };
      
      // Get documents to delete first to count them
      const docsToDelete = await this.vectorStore.similaritySearch('', 10000, filter);
      
      if (docsToDelete.length === 0) {
        this.logger.log(`No documents found for entity type: ${entityType}`);
        return 0;
      }

      // Delete documents using the vector store's delete method
      await this.vectorStore.delete({ filter });
      
      const deletedCount = docsToDelete.length;
      this.logger.log(`Removed ${deletedCount} documents for entity type: ${entityType}`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Error removing documents for entity type ${entityType}`, error);
      return 0;
    }
  }

  /**
   * Get the underlying vector store instance
   * @returns The PGVectorStore instance
   * @throws Error if vector store is not initialized
   */
  getVectorStore(): PGVectorStore {
    if (!this.isInitialized || !this.vectorStore) {
      throw new Error('Vector store not initialized. Please wait for initialization to complete.');
    }
    return this.vectorStore;
  }

  /**
   * Wait for the vector store to be ready
   * @param timeoutMs Maximum time to wait in milliseconds (default: 30000ms)
   * @throws Error if vector store fails to initialize within timeout
   */
  async waitUntilReady(timeoutMs = 30000): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        if (this.isInitialized) {
          clearInterval(checkInterval);
          resolve();
        } else if (Date.now() - startTime > timeoutMs) {
          clearInterval(checkInterval);
          reject(new Error('Vector store initialization timed out'));
        }
      }, 100);
    });
  }



  /**
   * Check if the vector store is initialized
   * @returns boolean indicating if the vector store is initialized
   */
  isReady(): boolean {
    return this.isInitialized && !!this.vectorStore;
  }

  /**
   * Chunk an array into smaller arrays
   * @private
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
