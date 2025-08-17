export interface SearchDocument {
  pageContent: string;
  metadata: Record<string, any>;
  [key: string]: any;
}

export interface SystemDataDocument {
  id: string;
  content: string;
  metadata: {
    entity_type: string;
    entity_id?: string;
    updatedAt?: string;
    checksum?: string;
    keywords?: string;
    [key: string]: any;
  };
}

export interface SyncStatus {
  entity_type: string;
  last_sync: Date;
  checksum: string;
  document_count: number;
}

export interface SearchFilters {
  entityTypes?: string[];
  dateRange?: { from: Date; to: Date };
  limit?: number;
}

export interface QueryResult {
  message: string;
  html: string;
  data?: any;
  conversationId: string;
  searchMetadata?: any;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ConversationListOptions {
  userId: string;
  limit?: number;
  offset?: number;
}

export interface ConversationMessagesOptions {
  conversationId: string;
  userId: string;
  limit?: number;
  offset?: number;
}

export interface SearchConversationMessagesOptions {
  conversationId: string;
  userId: string;
  query: string;
  limit?: number;
}

export interface PerformanceMetrics {
  queryCount: number;
  averageResponseTime: number;
  syncDurations: Map<string, number[]>;
  memoryUsage?: NodeJS.MemoryUsage;
  uptime?: string;
}

export interface DataQualityReport {
  totalDocuments: number;
  documentsByType: Record<string, number>;
  lastSyncTimes: Record<string, Date>;
  vectorStoreSize: string;
  averageDocumentSize: string;
  errorRates: Record<string, number>;
}

export interface VectorStoreStats {
  totalDocuments: number;
  documentsByType: Record<string, number>;
  lastUpdated: Date;
  averageVectorDimension: number;
  memoryUsage: string;
}
