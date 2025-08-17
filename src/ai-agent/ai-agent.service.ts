import { Injectable, Logger, OnModuleInit, Inject, forwardRef, InternalServerErrorException, NotFoundException, OnModuleDestroy, HttpException, HttpStatus, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConversationService, LlmService, SyncService, VectorStoreService } from './services';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';


@Injectable()
export class AiAgentService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiAgentService.name);
  private performanceMetrics = {
    queryCount: 0,
    averageResponseTime: 0,
    syncDurations: new Map<string, number[]>(),
    cacheHits: 0,
    cacheMisses: 0,
  };
  private isInitialized = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => SyncService)) private readonly syncService: SyncService,
    @Inject(forwardRef(() => ConversationService)) private readonly conversationService: ConversationService,
    @Inject(forwardRef(() => LlmService)) private readonly llmService: LlmService,
    @Inject(forwardRef(() => VectorStoreService)) private readonly vectorStoreService: VectorStoreService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async onModuleInit() {
    try {
      this.logger.log('Starting AI Agent service initialization...');
      this.isInitialized = true;
      this.logger.log('AI Agent service initialized');

      // Initial sync (don't block initialization if this fails)
      this.syncService.syncAllData()
        .catch(error => {
          this.logger.error('Initial sync failed, will retry on next interval', error);
        });

      // Schedule periodic sync with configurable interval
      const syncInterval = this.configService.get<number>('AI_SYNC_INTERVAL_MINUTES', 60) * 60 * 1000;
      this.syncInterval = setInterval(async () => {
        try {
          await this.syncService.syncAllData();
        } catch (syncError) {
          this.logger.error('Periodic sync failed', syncError);
        }
      }, syncInterval);

    } catch (error) {
      this.logger.error('Failed to initialize AI Agent service', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    // The vector store cleanup is now handled by VectorStoreService
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.logger.log('AI Agent service cleaned up successfully');
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncAllData() {
    if (!this.isInitialized) {
      this.logger.warn('Sync attempted before initialization completed');
      return;
    }
    return this.syncService.syncAllData();
  }

  //#region Vector store methods



  /**
   * Enhanced search with metadata filtering, context enrichment, and insights
   */
  async enhancedSearch(
    query: string,
    filters?: {
      entityTypes?: string[];
      dateRange?: { from: Date; to: Date };
      limit?: number;
    }
  ) {
    if (!this.isInitialized) {
      throw new Error('AI Agent is not initialized');
    }

    try {
      const startTime = Date.now();

      // Use the enhanced search service
      const enhancedResults = await this.llmService.enhancedSearch(query, {
        entityTypes: filters?.entityTypes,
        dateRange: filters?.dateRange,
        limit: filters?.limit
      });

      const responseTime = Date.now() - startTime;

      return {
        query,
        searchResults: enhancedResults.searchResults,
        // metadataInsights: enhancedResults.metadataInsights,
        // recommendations: enhancedResults.recommendations,
        // enrichedContext: enhancedResults.enrichedContext,
        totalResults: enhancedResults.totalResults,
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error in enhanced search', error);
      throw new Error('Enhanced search failed');
    }
  }

  /**
   * Handle user queries with caching and performance optimizations
   * @param query User's natural language query
   * @param userId User ID for authentication and conversation tracking
   * @param conversationId Optional conversation ID for context
   * @returns AI response with formatted data
   */
  async handleQuery(
    query: string,
    userId: string,
    conversationId?: string
  ) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 9);
    this.logger.log(`[${requestId}] Handling query: ${query.substring(0, 50)}...`);

    if (!this.isInitialized) {
      const errorMsg = 'AI Agent is not initialized';
      this.logger.error(`[${requestId}] ${errorMsg}`);
      throw new InternalServerErrorException(errorMsg);
    }

    if (!query?.trim()) {
      const errorMsg = 'Empty query received';
      this.logger.error(`[${requestId}] ${errorMsg}`);
      throw new BadRequestException('Query cannot be empty');
    }

    if (!userId) {
      const errorMsg = 'User ID is required';
      this.logger.error(`[${requestId}] ${errorMsg}`);
      throw new UnauthorizedException('User authentication required');
    }

    try {
      // Check cache first for similar queries
      const cacheKey = this.generateCacheKey(query, userId);
      const cachedResult = await this.getCachedResult(cacheKey);
      if (cachedResult) {
        this.performanceMetrics.cacheHits++;
        this.logger.debug(`[${requestId}] Cache hit for query`);
        return cachedResult;
      }
      this.performanceMetrics.cacheMisses++;

      // Create a new conversation if no conversationId is provided
      if (!conversationId) {
        this.logger.debug(`[${requestId}] Creating new conversation for user: ${userId}`);
        const conversation = await this.conversationService.createConversation(userId, query.substring(0, 50));
        conversationId = conversation.id;
        this.logger.debug(`[${requestId}] Created new conversation: ${conversationId}`);
      }

      // Get or verify conversation
      this.logger.debug(`[${requestId}] Looking up conversation: ${conversationId}`);
      const conversation = await this.conversationService.getConversation(conversationId, userId);
      this.logger.debug(`[${requestId}] Found conversation: ${conversation ? 'yes' : 'no'}`);

      if (!conversation) throw new NotFoundException('Conversation not found');

      // Save user message to conversation
      this.logger.debug(`[${requestId}] Saving user message...`);
      await this.conversationService.addMessage(conversationId, query, 'user', { requestId });
      this.logger.debug(`[${requestId}] Saved user message`);

      // Use the new enhanced chat method
      this.logger.debug(`[${requestId}] Starting enhanced chat...`);
      const chatResult = await this.llmService.chat(
        query,
        conversationId, // Use conversationId as sessionId
        userId,
        {
          useEnhancedSearch: true, // Enable enhanced search by default
          filters: {
            metadata: this.extractMetadataFromQuery(query)
          }
        }
      );

      this.logger.debug(`[${requestId}] Chat completed, response length: ${chatResult.response.length}`);

      // Save assistant response to conversation
      try {
        await this.conversationService.addMessage(
          conversationId,
          chatResult.response,
          'assistant',
          {
            requestId,
            searchMetadata: chatResult.metadata.searchMetadata,
            sessionMetadata: {
              messageCount: chatResult.metadata.messageCount,
              sessionAge: chatResult.metadata.sessionAge
            }
          }
        );
      } catch (error) {
        this.logger.error(`[${requestId}] Failed to save assistant message: ${error.message}`, error.stack);
      }

      // Convert answer to safe HTML
      const html = await this.conversationService.convertToSafeHtml(chatResult.response);

      // Update performance metrics
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(responseTime);

      // Cache the result
      const result = {
        message: chatResult.response,
        html,
        conversationId: conversation.id,
        enhancedContext: true,
        searchMetadata: {
          ...chatResult.metadata.searchMetadata,
          responseTime,
          query: query,
          timestamp: new Date().toISOString()
        },
        sessionMetadata: chatResult.metadata
      };

      await this.cacheResult(cacheKey, result);

      this.logger.log(`[${requestId}] Query completed in ${responseTime}ms`);
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error(`[${requestId}] Query failed after ${responseTime}ms`, error);
      throw error;
    }
  }


  /**
   * Generate cache key for query caching
   */
  private generateCacheKey(query: string, userId: string): string {
    const normalizedQuery = query.toLowerCase().trim();
    return `ai_query:${userId}:${this.hashString(normalizedQuery)}`;
  }

  /**
   * Simple string hashing for cache keys
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached result if available and not expired
   */
  private async getCachedResult(cacheKey: string): Promise<any | null> {
    try {
      const cached = await this.cacheManager.get(cacheKey);
      return cached || null;
    } catch (error) {
      this.logger.warn('Cache retrieval failed', error);
      return null;
    }
  }

  /**
   * Cache query result
   */
  private async cacheResult(cacheKey: string, result: any): Promise<void> {
    try {
      await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
    } catch (error) {
      this.logger.warn('Cache storage failed', error);
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(responseTime: number): void {
    this.performanceMetrics.queryCount++;
    const currentAvg = this.performanceMetrics.averageResponseTime;
    const newAvg = (currentAvg * (this.performanceMetrics.queryCount - 1) + responseTime) / this.performanceMetrics.queryCount;
    this.performanceMetrics.averageResponseTime = newAvg;
  }

  /**
   * Extract metadata filters from query text
   */
  private extractMetadataFromQuery(query: string): Record<string, any> {
    const metadata: Record<string, any> = {};

    // Extract invoice-related metadata
    if (query.includes('فاتورة') || query.includes('invoice')) {
      metadata.type = 'invoice';
    }

    // Extract vendor/supplier metadata
    if (query.includes('مورد') || query.includes('vendor') || query.includes('supplier')) {
      metadata.entity_type = 'vendor';
    }

    // Extract product metadata
    if (query.includes('منتج') || query.includes('product')) {
      metadata.entity_type = 'product';
    }

    // Extract user metadata
    if (query.includes('مستخدم') || query.includes('user')) {
      metadata.entity_type = 'user';
    }

    // Extract date patterns
    const datePattern = /(\d{4}-\d{2}-\d{2})|(\d{2}\/\d{2}\/\d{4})/;
    const dateMatch = query.match(datePattern);
    if (dateMatch) {
      metadata.date = dateMatch[0];
    }

    // Extract ID patterns
    const idPattern = /(رقم|ID|id)\s*(\d+)/;
    const idMatch = query.match(idPattern);
    if (idMatch) {
      metadata.id = idMatch[2];
    }

    return metadata;
  }

  //#endregion


  //#region Provider Management Methods

  /**
   * Switch between Ollama and Hugging Face providers
   */
  async switchProvider(provider: 'ollama' | 'huggingface'): Promise<void> {
    if (!this.isInitialized) throw new Error('AI Agent is not initialized');
    try {
      await this.llmService.switchProvider(provider);
      this.logger.log(`Switched to ${provider} provider`);
    } catch (error) {
      this.logger.error(`Failed to switch to ${provider} provider`, error);
      throw error;
    }
  }

  /**
   * Get current LLM provider
   */
  getCurrentProvider(): string {
    if (!this.isInitialized) throw new Error('AI Agent is not initialized');
    return this.llmService.getCurrentProvider();
  }

  /**
   * Simple health check for the main controller
   */
  async healthCheck() {
    return {
      status: this.isInitialized,
      services: {
        llm: this.llmService.isReady(),
        vectorStore: this.vectorStoreService.isReady(),
        conversation: true, // Always available
      },
      performance: this.performanceMetrics,
      timestamp: new Date().toISOString()
    };
  }

  //#endregion
}