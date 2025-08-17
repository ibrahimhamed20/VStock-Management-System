import { Injectable, Logger } from '@nestjs/common';
import { VectorStoreService } from './vector-store.service';

export interface EnhancedSearchFilters {
  entityTypes?: string[];
  dateRange?: { from: Date; to: Date };
  metadata?: Record<string, any>;
  limit?: number;
  similarityThreshold?: number;
}

export interface SearchResult {
  content: string;
  metadata: Record<string, any>;
  similarity: number;
  entityType: string;
  relevanceScore: number;
  // Enhanced fields from enriched sync
  summary?: string;
  tags?: string[];
  keywords?: string[];
  relationships?: any[];
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  confidenceScore?: number;
}

export interface MetadataInsights {
  entityTypes: Map<string, number>;
  dateRanges: Map<string, number>;
  commonFields: Map<string, number>;
  uniqueValues: Map<string, Set<any>>;
}

export interface EnrichedContext {
  mainDocuments: any[];
  relatedDocuments: any[];
  summary: string;
  metadata: Record<string, any>;
}

@Injectable()
export class EnhancedSearchService {
  private readonly logger = new Logger(EnhancedSearchService.name);

  constructor(private readonly vectorStoreService: VectorStoreService) {}

  /**
   * Enhanced search with metadata filtering and relevance scoring
   */
  async enhancedSearch(
    query: string,
    filters?: EnhancedSearchFilters
  ): Promise<SearchResult[]> {
    try {
      const searchOptions: any = {
        k: filters?.limit || 15
      };

      // Build metadata filter
      const metadataFilter: any = {};
      
      if (filters?.entityTypes?.length) {
        metadataFilter.entity_type = { $in: filters.entityTypes };
      }

      if (filters?.dateRange) {
        metadataFilter.updatedAt = {
          $gte: filters.dateRange.from.toISOString(),
          $lte: filters.dateRange.to.toISOString()
        };
      }

      // Add custom metadata filters
      if (filters?.metadata) {
        Object.assign(metadataFilter, filters.metadata);
      }

      // Enhanced metadata filtering for enriched documents
      if (filters?.metadata?.priority) {
        metadataFilter.priority = filters.metadata.priority;
      }

      if (filters?.metadata?.tags) {
        metadataFilter.tags = { $contains: filters.metadata.tags };
      }

      if (filters?.metadata?.keywords) {
        metadataFilter.keywords = { $contains: filters.metadata.keywords };
      }

      if (Object.keys(metadataFilter).length > 0) {
        searchOptions.filter = metadataFilter;
      }

      // Perform similarity search
      const docs = await this.vectorStoreService.similaritySearch(
        query, 
        searchOptions.k, 
        searchOptions.filter
      );

      // Enhance results with relevance scoring and enhanced metadata
      return docs.map((doc, index) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        similarity: 1 - (index / docs.length), // Simple similarity score
        entityType: doc.metadata.entity_type || 'unknown',
        relevanceScore: this.calculateRelevanceScore(doc, query, filters),
        // Enhanced fields from enriched sync
        summary: doc.metadata.summary,
        tags: doc.metadata.tags ? doc.metadata.tags.split(',') : [],
        keywords: doc.metadata.keywords ? doc.metadata.keywords.split(',') : [],
        relationships: doc.metadata.relationships ? JSON.parse(doc.metadata.relationships) : [],
        priority: doc.metadata.priority,
        category: doc.metadata.category,
        confidenceScore: doc.metadata.confidence_score
      }));
    } catch (error) {
      this.logger.error('Enhanced search error:', error);
      throw new Error('Enhanced search failed');
    }
  }

  /**
   * Extract metadata insights from search results
   */
  extractMetadataInsights(searchResults: SearchResult[]): MetadataInsights {
    const insights = {
      entityTypes: new Map<string, number>(),
      dateRanges: new Map<string, number>(),
      commonFields: new Map<string, number>(),
      uniqueValues: new Map<string, Set<any>>()
    };

    searchResults.forEach(result => {
      // Count entity types
      const entityType = result.metadata?.entity_type || 'unknown';
      insights.entityTypes.set(entityType, (insights.entityTypes.get(entityType) || 0) + 1);

      // Analyze dates
      if (result.metadata?.updatedAt) {
        const date = new Date(result.metadata.updatedAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        insights.dateRanges.set(monthKey, (insights.dateRanges.get(monthKey) || 0) + 1);
      }

      // Analyze metadata fields
      Object.entries(result.metadata || {}).forEach(([key, value]) => {
        insights.commonFields.set(key, (insights.commonFields.get(key) || 0) + 1);
        
        if (!insights.uniqueValues.has(key)) {
          insights.uniqueValues.set(key, new Set());
        }
        insights.uniqueValues.get(key)!.add(value);
      });
    });

    return insights;
  }

  /**
   * Generate insights from metadata analysis
   */
  generateInsights(metadata: MetadataInsights): string[] {
    const insights: string[] = [];

    // Most common entity types
    const topEntityTypes = Array.from(metadata.entityTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (topEntityTypes.length > 0) {
      insights.push(`Most common document types: ${topEntityTypes.map(([type, count]) => `${type} (${count})`).join(', ')}`);
    }

    // Date patterns
    const recentDates = Array.from(metadata.dateRanges.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 3);
    
    if (recentDates.length > 0) {
      insights.push(`Recent activity periods: ${recentDates.map(([date, count]) => `${date} (${count} docs)`).join(', ')}`);
    }

    return insights;
  }

  /**
   * Generate recommendations based on metadata analysis
   */
  generateRecommendations(metadata: MetadataInsights): string[] {
    const recommendations: string[] = [];

    // Suggest filters based on common patterns
    const topEntityTypes = Array.from(metadata.entityTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);
    
    if (topEntityTypes.length > 0) {
      recommendations.push(`Consider filtering by entity types: ${topEntityTypes.map(([type]) => type).join(', ')}`);
    }

    // Suggest date range filters
    const dateEntries = Array.from(metadata.dateRanges.entries());
    if (dateEntries.length > 0) {
      const recentDate = dateEntries.sort((a, b) => b[0].localeCompare(a[0]))[0];
      recommendations.push(`Consider filtering by recent date range around ${recentDate[0]}`);
    }

    return recommendations;
  }

  /**
   * Enrich context by finding related documents
   */
  async enrichContext(documents: SearchResult[], query: string): Promise<EnrichedContext> {
    const enrichedContext: any = {
      mainDocuments: documents,
      relatedDocuments: [],
      summary: '',
      metadata: {}
    };

    // Find related documents based on metadata
    for (const doc of documents) {
      const related = await this.findRelatedDocuments(doc);
      enrichedContext.relatedDocuments.push(...related);
    }

    // Remove duplicates
    enrichedContext.relatedDocuments = this.removeDuplicateDocuments(enrichedContext.relatedDocuments);

    // Generate summary
    enrichedContext.summary = this.generateContextSummary(documents, enrichedContext.relatedDocuments, query);

    // Aggregate metadata
    enrichedContext.metadata = this.aggregateMetadata([...documents, ...enrichedContext.relatedDocuments]);

    return enrichedContext;
  }

  /**
   * Find related documents based on metadata
   */
  private async findRelatedDocuments(document: SearchResult): Promise<SearchResult[]> {
    const related: SearchResult[] = [];

    // Find documents with same entity type
    if (document.metadata?.entity_type) {
      const sameTypeDocs = await this.vectorStoreService.similaritySearch(
        document.content,
        5,
        { entity_type: document.metadata.entity_type }
      );
      related.push(...sameTypeDocs.map((doc, index) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        similarity: 1 - (index / sameTypeDocs.length),
        entityType: doc.metadata.entity_type || 'unknown',
        relevanceScore: 0.7 // Related documents get a moderate score
      })));
    }

    // Find documents with similar metadata
    if (document.metadata?.entity_id) {
      const relatedDocs = await this.vectorStoreService.similaritySearch(
        `entity_id:${document.metadata.entity_id}`,
        3
      );
      related.push(...relatedDocs.map((doc, index) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        similarity: 1 - (index / relatedDocs.length),
        entityType: doc.metadata.entity_type || 'unknown',
        relevanceScore: 0.6
      })));
    }

    return related;
  }

  /**
   * Remove duplicate documents
   */
  private removeDuplicateDocuments(documents: SearchResult[]): SearchResult[] {
    const seen = new Set();
    return documents.filter(doc => {
      const key = `${doc.metadata?.entity_type}-${doc.metadata?.entity_id}-${doc.content.substring(0, 50)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Generate context summary
   */
  private generateContextSummary(mainDocs: SearchResult[], relatedDocs: SearchResult[], query: string): string {
    const totalDocs = mainDocs.length + relatedDocs.length;
    const entityTypes = new Set([...mainDocs, ...relatedDocs].map(doc => doc.entityType).filter(Boolean));
    
    return `Found ${totalDocs} documents (${mainDocs.length} primary, ${relatedDocs.length} related) across ${entityTypes.size} entity types. Query: "${query}"`;
  }

  /**
   * Aggregate metadata from documents
   */
  private aggregateMetadata(documents: SearchResult[]): Record<string, any> {
    const aggregated: Record<string, any> = {};
    
    documents.forEach(doc => {
      Object.entries(doc.metadata || {}).forEach(([key, value]) => {
        if (!aggregated[key]) {
          aggregated[key] = new Set();
        }
        aggregated[key].add(value);
      });
    });

    // Convert sets to arrays
    Object.keys(aggregated).forEach(key => {
      aggregated[key] = Array.from(aggregated[key]);
    });

    return aggregated;
  }

  /**
   * Calculate relevance score for a document with enhanced metadata
   */
  private calculateRelevanceScore(
    doc: any, 
    query: string, 
    filters?: EnhancedSearchFilters
  ): number {
    let score = 0.5; // Base score

    // Boost score for metadata matches
    if (filters?.metadata) {
      for (const [key, value] of Object.entries(filters.metadata)) {
        if (doc.metadata[key] === value) {
          score += 0.2;
        }
      }
    }

    // Boost score for entity type matches
    if (filters?.entityTypes?.includes(doc.metadata.entity_type)) {
      score += 0.3;
    }

    // Enhanced scoring with enriched metadata
    if (doc.metadata.priority) {
      switch (doc.metadata.priority) {
        case 'high':
          score += 0.3;
          break;
        case 'medium':
          score += 0.2;
          break;
        case 'low':
          score += 0.1;
          break;
      }
    }

    // Boost score for keyword matches
    if (doc.metadata.keywords) {
      const keywords = doc.metadata.keywords.split(',');
      const queryWords = query.toLowerCase().split(' ');
      const keywordMatches = keywords.filter(keyword => 
        queryWords.some(word => keyword.toLowerCase().includes(word))
      );
      score += (keywordMatches.length / keywords.length) * 0.25;
    }

    // Boost score for tag matches
    if (doc.metadata.tags) {
      const tags = doc.metadata.tags.split(',');
      const queryWords = query.toLowerCase().split(' ');
      const tagMatches = tags.filter(tag => 
        queryWords.some(word => tag.toLowerCase().includes(word))
      );
      score += (tagMatches.length / tags.length) * 0.2;
    }

    // Boost score for confidence score
    if (doc.metadata.confidence_score) {
      score += doc.metadata.confidence_score * 0.1;
    }

    // Boost score for content relevance (simple keyword matching)
    const queryWords = query.toLowerCase().split(' ');
    const contentWords = doc.pageContent.toLowerCase().split(' ');
    const matches = queryWords.filter(word => 
      contentWords.some(contentWord => contentWord.includes(word))
    );
    score += (matches.length / queryWords.length) * 0.2;

    return Math.min(score, 1.0);
  }
} 