import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { SyncService } from './sync.service';
import { VectorStoreService } from './vector-store.service';
import { LlmService } from './llm.service';
import { EmbeddingsService } from './embeddings.service';

export interface SyncStatus {
  last_sync?: Date;
  document_count?: number;
  error?: string;
  duration?: number;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly syncService: SyncService,
    private readonly vectorStoreService: VectorStoreService,
    private readonly embeddingsService: EmbeddingsService
  ) {}

  /**
   * Get sync status for all entity types
   * @returns Sync status map
   */
  async getSyncStatus(): Promise<Map<string, SyncStatus>> {
    try {
      const status = await this.syncService.getSyncStatus();
      if (status instanceof Map) return status;
      return new Map(Object.entries(status));
    } catch (error) {
      this.logger.error('Failed to get sync status', error);
      throw new InternalServerErrorException('Failed to get sync status');
    }
  }

  /**
   * Get detailed service health status
   * @returns Service health object
   */
  async getServiceHealth() {
    try {
      const syncStatus = await this.getSyncStatus();
      const lastSyncTimes = Object.fromEntries(
        Array.from(syncStatus.entries()).map(([key, value]) => [
          key,
          value?.last_sync || new Date()
        ])
      );

      // Check vector store connection
      let vectorStoreStatus = 'disconnected';
      try {
        if (this.vectorStoreService.getVectorStore()) {
          // Try a simple operation to verify connection
          await this.vectorStoreService.getVectorStore().similaritySearch('test', 1);
          vectorStoreStatus = 'connected';
        }
      } catch (error) {
        this.logger.warn('Vector store connection check failed', error);
        vectorStoreStatus = 'error';
      }

      // Check LLM service connection
      let llmStatus = 'disconnected';
      try {
        if (this.embeddingsService.isReady()) {
          // Try a simple operation to verify connection
          await this.embeddingsService.getEmbedding('health check');
          llmStatus = 'connected';
        }
      } catch (error) {
        this.logger.warn('Embeddings service health check failed', error);
        llmStatus = 'error';
      }

      return {
        status: vectorStoreStatus === 'connected' && llmStatus === 'connected' ? 'healthy' : 'degraded',
        isVectorStoreConnected: vectorStoreStatus === 'connected',
        isEmbeddingsServiceConnected: llmStatus === 'connected',
        lastSyncTimes,
        uptime: process.uptime()
      };
    } catch (error) {
      this.logger.error('Error getting service health', error);
      throw new InternalServerErrorException('Failed to get service health');
    }
  }

  /**
   * Get data quality report
   * @returns Data quality metrics
   */
  async getDataQualityReport() {
    try {
      const syncStatus = await this.getSyncStatus();
      const entityTypes = Array.from(syncStatus.keys());

      const report = {
        timestamp: new Date().toISOString(),
        entities: entityTypes.map(type => ({
          type,
          ...syncStatus.get(type),
          lastSync: syncStatus.get(type)?.last_sync?.toISOString() || null,
        })),
        summary: {
          totalEntities: entityTypes.length,
          syncedEntities: entityTypes.filter(type => syncStatus.get(type)?.last_sync).length,
          totalDocuments: Array.from(syncStatus.values()).reduce((sum, status) => sum + (status.document_count || 0), 0),
        },
      };

      return report;
    } catch (error) {
      this.logger.error('Failed to generate data quality report', error);
      throw new InternalServerErrorException('Failed to generate data quality report');
    }
  }

  /**
   * Get performance metrics
   * @returns Performance metrics
   */
  getPerformanceMetrics() {
    try {
      const metrics = this.syncService.getSyncDurations();

      // Calculate average sync durations
      const avgSyncDurations: Record<string, number> = {};
      for (const [entityType, durations] of metrics.entries()) {
        avgSyncDurations[entityType] = durations.length > 0
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0;
      }

      return {
        avgSyncDurations,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get performance metrics', error);
      throw new InternalServerErrorException('Failed to get performance metrics');
    }
  }

  /**
   * Force sync a specific entity type
   * @param entityType Type of entity to sync
   * @returns Sync result
   */
  async forceSyncEntity(entityType: string) {
    try {
      const syncMethod = `sync${entityType.charAt(0).toUpperCase() + entityType.slice(1)}` as keyof SyncService;

      if (typeof this.syncService[syncMethod] === 'function') {
        await this.syncService.syncWithRetry(
          () => (this.syncService[syncMethod] as () => Promise<any>)(),
          entityType
        );
        return { success: true, message: `Successfully synced ${entityType}` };
      }

      throw new Error(`No sync method found for entity type: ${entityType}`);
    } catch (error) {
      this.logger.error(`Failed to sync entity ${entityType}`, error);
      throw new InternalServerErrorException(`Failed to sync entity: ${error.message}`);
    }
  }

  /**
   * Clear the vector store
   * @returns Result of the operation
   */
  async clearVectorStore() {
    try {
      const result = await this.vectorStoreService.clear();

      // Reset sync status
      this.syncService.clearAllStatuses();
      await this.syncService.loadSyncStatus();

      return result;
    } catch (error) {
      this.logger.error('Failed to clear vector store', error);
      throw new InternalServerErrorException('Failed to clear vector store');
    }
  }

  /**
   * Search for similar content in the vector store
   * @param query Search query
   * @param limit Maximum number of results to return
   * @returns Array of similar documents with scores
   */
  async searchSimilarContent(query: string, limit = 10) {
    try {
      const results = await this.vectorStoreService.similaritySearch(query, limit);
      return results.map(doc => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        score: doc.metadata?._distance || 0,
      }));
    } catch (error) {
      this.logger.error('Failed to search similar content', error);
      throw new InternalServerErrorException('Failed to search similar content');
    }
  }

  /**
   * Get vector store statistics
   * @returns Statistics about the vector store
   */
  async getVectorStoreStats() {
    try {
      return await this.vectorStoreService.getStats();
    } catch (error) {
      this.logger.error('Error getting vector store stats', error);
      throw new InternalServerErrorException('Failed to get vector store stats');
    }
  }
} 