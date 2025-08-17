import { Inject, Injectable, Logger, OnModuleInit, OnModuleDestroy, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncStatusEntity } from '../entities/sync-status.entity';
import { SyncStatus } from '../interfaces/ai-agent.interface';
import { UsersService } from '../../users/services/users.service';
import { ConfigService } from '@nestjs/config';
import { ClientsService } from '../../clients/clients.service';
import { InventoryService } from '../../inventory/inventory.service';
import { AccountingService } from '../../accounting/accounting.service';
import { PurchasingService } from '../../purchasing/purchasing.service';
import { SalesService } from '../../sales/sales.service';
import { VectorStoreService } from './vector-store.service';
import * as crypto from 'crypto';
import { IPurchase } from 'src/purchasing/interfaces/purchase.interface';
import { IInvoice } from 'src/sales/interfaces/invoice.interface';

// interfaces for rich content and metadata
export interface SystemDataDocument {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  keywords: string[];
  tags: string[];
  relationships: Relationship[];
  summary: string;
}

export interface DocumentMetadata {
  entity_type: string;
  entity_id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_modified_by?: string;
  version: number;
  is_active: boolean;
  language: string;
  source_system: string;
  confidence_score: number;
  [key: string]: any;
}

export interface Relationship {
  type: 'parent' | 'child' | 'related' | 'depends_on' | 'references';
  entity_type: string;
  entity_id: string;
  strength: number; // 0-1
  description: string;
}

export interface ContentEnrichmentOptions {
  includeRelationships?: boolean;
  includeKeywords?: boolean;
  includeSummary?: boolean;
  includeTags?: boolean;
  maxContentLength?: number;
  language?: string;
}

@Injectable()
export class SyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SyncService.name);
  private syncStatusMap = new Map<string, SyncStatus>();
  private syncDurations = new Map<string, number[]>();

  constructor(
    @InjectRepository(SyncStatusEntity)
    private readonly syncStatusRepo: Repository<SyncStatusEntity>,
    @Inject(forwardRef(() => ConfigService)) private configService: ConfigService,
    @Inject(forwardRef(() => UsersService)) private userService: UsersService,
    @Inject(forwardRef(() => ClientsService)) private clientService: ClientsService,
    @Inject(forwardRef(() => InventoryService)) private inventoryService: InventoryService,
    @Inject(forwardRef(() => AccountingService)) private accountingService: AccountingService,
    @Inject(forwardRef(() => PurchasingService)) private purchaseService: PurchasingService,
    @Inject(forwardRef(() => SalesService)) private salesService: SalesService,
    @Inject(forwardRef(() => VectorStoreService)) private vectorStoreService: VectorStoreService,
  ) { }

  async onModuleInit() {
    await this.loadSyncStatus();
  }

  /**
   * Check if database connection is healthy
   */
  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      // Try a simple query to check connection health
      await this.syncStatusRepo.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('Database connection check failed:', error);
      return false;
    }
  }

  /**
   * Attempt to recover database connection
   */
  private async attemptConnectionRecovery(): Promise<boolean> {
    try {
      this.logger.log('Attempting database connection recovery...');
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try the connection check again
      const isHealthy = await this.checkDatabaseConnection();
      if (isHealthy) {
        this.logger.log('Database connection recovered successfully');
        return true;
      } else {
        this.logger.warn('Database connection recovery failed');
        return false;
      }
    } catch (error) {
      this.logger.error('Error during connection recovery:', error);
      return false;
    }
  }

  async loadSyncStatus() {
    try {
      const syncStatuses = await this.syncStatusRepo.find();
      const entityTypes = [
        'users', 'clients', 'products', 'suppliers',
        'purchases', 'invoices', 'ledgers', 'balances', 'system_features'
      ];

      for (const entityType of entityTypes) {
        const existing = syncStatuses.find(s => s.entity_type === entityType);

        if (existing) {
          this.syncStatusMap.set(entityType, {
            entity_type: existing.entity_type,
            last_sync: existing.last_sync,
            checksum: existing.checksum,
            document_count: existing.document_count
          });
        } else {
          const newStatus = this.syncStatusRepo.create({
            entity_type: entityType,
            last_sync: new Date(),
            checksum: '',
            document_count: 0
          });
          await this.syncStatusRepo.save(newStatus);

          this.syncStatusMap.set(entityType, {
            entity_type: entityType,
            last_sync: new Date(),
            checksum: '',
            document_count: 0
          });
        }
      }
    } catch (error) {
      this.logger.error('Error loading sync status', error);
    }
  }

  async updateSyncStatus(
    entityType: string,
    checksum: string,
    documentCount: number,
    error?: string,
    durationMs?: number
  ) {
    try {
      // Check database connection before attempting update
      const isHealthy = await this.checkDatabaseConnection();
      if (!isHealthy) {
        this.logger.warn(`Skipping sync status update for ${entityType} - database connection unhealthy`);
        return;
      }

      const status: Partial<SyncStatusEntity> = {
        entity_type: entityType,
        last_sync: new Date(),
        checksum,
        document_count: documentCount,
        last_error: error || undefined,
      };

      await this.syncStatusRepo.upsert(status, ['entity_type']);

      this.syncStatusMap.set(entityType, {
        entity_type: entityType,
        last_sync: status.last_sync || new Date(0),
        checksum,
        document_count: documentCount
      });

      if (durationMs) {
        const durations = this.syncDurations.get(entityType) || [];
        durations.push(durationMs);
        // Keep only last 10 durations for averaging
        if (durations.length > 10) {
          durations.shift();
        }
        this.syncDurations.set(entityType, durations);
      }
    } catch (error) {
      this.logger.error(`Error updating sync status for ${entityType}`, error);
      // Don't throw error to prevent cascading failures
    }
  }

  async getSyncStatus(entityType?: string): Promise<SyncStatus | Map<string, SyncStatus>> {
    if (entityType) {
      return this.syncStatusMap.get(entityType) || {
        entity_type: entityType,
        last_sync: new Date(0),
        checksum: '',
        document_count: 0
      };
    }
    return this.syncStatusMap;
  }

  /**
   * Calculate checksum for data to detect changes
   */
  private calculateChecksum(data: any[]): string {
    const sortedData = data.sort((a, b) => {
      const aId = a.id || a.userId || a.productId || a.clientId || '';
      const bId = b.id || b.userId || b.productId || b.clientId || '';
      return aId.localeCompare(bId);
    });
    
    const dataString = JSON.stringify(sortedData);
    return crypto.createHash('md5').update(dataString).digest('hex');
  }

  /**
   * Check if data has changed since last sync
   */
  private async hasChanges(entityType: string, currentData: any[]): Promise<boolean> {
    const currentChecksum = this.calculateChecksum(currentData);
    const lastStatus = this.syncStatusMap.get(entityType);
    
    if (!lastStatus || !lastStatus.checksum) {
      return true; // First sync
    }
    
    return currentChecksum !== lastStatus.checksum;
  }

  /**
   * Get last sync time for entity
   */
  private async getLastSyncTime(entityType: string): Promise<Date> {
    const status = this.syncStatusMap.get(entityType);
    return status?.last_sync || new Date(0);
  }

  /**
   * Get changes since last sync (for incremental sync)
   * Filters data based on updatedAt timestamp for incremental synchronization
   */
  private async getChangesSince(entityType: string, lastSync: Date): Promise<any[]> {
    try {
      // If lastSync is epoch (0), return all data for initial sync
      const isInitialSync = lastSync.getTime() === 0;
      
      switch (entityType) {
        case 'users':
          const usersResult = await this.userService.findAllUsers(1, 10000);
          const allUsers = usersResult.data || [];
          return isInitialSync ? allUsers : allUsers.filter(user => 
            user.updatedAt && new Date(user.updatedAt) > lastSync
          );
          
        case 'clients':
          const allClients = await this.clientService.findAll();
          return isInitialSync ? allClients : allClients.filter(client => 
            client.updatedAt && new Date(client.updatedAt) > lastSync
          );
          
        case 'products':
          const allProducts = await this.inventoryService.findAllProducts();
          return isInitialSync ? allProducts : allProducts.filter(product => 
            product.updatedAt && new Date(product.updatedAt) > lastSync
          );
          
        case 'suppliers':
          const allSuppliers = await this.purchaseService.findAllSuppliers();
          return isInitialSync ? allSuppliers : allSuppliers.filter(supplier => 
            supplier.updatedAt && new Date(supplier.updatedAt) > lastSync
          );
          
        case 'purchases':
          const allPurchases = await this.purchaseService.findAllPurchases();
          return isInitialSync ? allPurchases : allPurchases.filter(purchase => 
            purchase.updatedAt && new Date(purchase.updatedAt) > lastSync
          );
          
        case 'invoices':
          try {
            const allInvoices = await this.salesService.findAllInvoices();
            return isInitialSync ? allInvoices : allInvoices.filter(invoice => 
              invoice.updatedAt && new Date(invoice.updatedAt) > lastSync
            );
          } catch (invoiceError) {
            this.logger.error(`Error getting invoices: ${invoiceError.message}`, invoiceError);
            return [];
          }
          
        case 'ledgers':
          // TODO: Implement when accounting service has the method
          return [];
          
        case 'balances':
          // TODO: Implement when accounting service has the method
          return [];
          
        case 'system_features':
          // System features are static, only sync on initial sync
          return isInitialSync ? [
            {
              id: 'ai-agent',
              name: 'AI Agent',
              description: 'Natural language interface for business intelligence',
              capabilities: ['Query processing', 'Semantic search', 'Data analysis']
            },
            {
              id: 'inventory-management',
              name: 'Inventory Management',
              description: 'Product and stock management system',
              capabilities: ['Product tracking', 'Stock movements', 'Batch management']
            },
            {
              id: 'sales-management',
              name: 'Sales Management',
              description: 'Invoice and payment processing',
              capabilities: ['Invoice creation', 'Payment tracking', 'Client management']
            },
            {
              id: 'purchasing',
              name: 'Purchasing',
              description: 'Supplier and purchase order management',
              capabilities: ['Supplier management', 'Purchase orders', 'Order tracking']
            },
            {
              id: 'accounting',
              name: 'Accounting',
              description: 'Financial management and reporting',
              capabilities: ['Journal entries', 'Account management', 'Financial reports']
            }
          ] : [];
          
        default:
          this.logger.warn(`No incremental sync support for entity type: ${entityType}`);
          return [];
      }
    } catch (error) {
      this.logger.error(`Error getting changes for ${entityType}`, error);
      return [];
    }
  }

  async syncWithRetry<T>(
    syncFunction: () => Promise<T>,
    entityType: string,
    maxRetries = 3
  ): Promise<T | null> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Check database connection before each attempt
        const isHealthy = await this.checkDatabaseConnection();
        if (!isHealthy) {
          this.logger.warn(`Database connection unhealthy for ${entityType}, attempt ${attempt}`);
          if (attempt < maxRetries) {
            // Try to recover connection
            const recovered = await this.attemptConnectionRecovery();
            if (!recovered) {
              const delay = Math.pow(2, attempt) * 1000;
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
        }

        const startTime = Date.now();
        const result = await syncFunction();
        const duration = Date.now() - startTime;

        this.logger.log(`Successfully synced ${entityType} in ${duration}ms (attempt ${attempt})`);
        return result;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Sync attempt ${attempt} failed for ${entityType}: ${error.message}`);

        if (attempt < maxRetries) {
          // Exponential backoff: wait 2^attempt seconds
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.logger.error(`All sync attempts failed for ${entityType}`, lastError);
    await this.updateSyncStatus(entityType, '', 0, lastError?.message);
    return null;
  }

  getSyncDurations() {
    return this.syncDurations;
  }

  clearAllStatuses() {
    this.syncStatusMap.clear();
    this.syncDurations.clear();
  }

  /**
   * Graceful shutdown method to clean up resources
   */
  async onModuleDestroy() {
    this.logger.log('Shutting down sync service...');
    // Clear in-memory data
    this.clearAllStatuses();
    this.logger.log('Sync service shutdown complete');
  }

  /**
   * sync for users with rich content and metadata - INCREMENTAL VERSION
   */
  async syncUsers() {
    return this.syncWithRetry(async () => {
      const startTime = Date.now();
      
      // Get last sync time for incremental sync
      const lastSyncTime = await this.getLastSyncTime('users');
      
      // Get changes since last sync
      const changedUsers = await this.getChangesSince('users', lastSyncTime);
      
      if (changedUsers.length === 0) {
        this.logger.log('No changes detected for users since last sync, skipping');
        return { synced: 0, skipped: true };
      }

      this.logger.log(`Found ${changedUsers.length} user changes since ${lastSyncTime.toISOString()}`);

      const enhancedDocuments: SystemDataDocument[] = changedUsers.map(user => {
        const content = this.generateUserContent(user);
        const metadata = this.generateUserMetadata(user);
        const keywords = this.extractUserKeywords(user);
        const tags = this.generateUserTags(user);
        const relationships = this.findUserRelationships(user, changedUsers);
        const summary = this.generateUserSummary(user);

        return {
          id: user.id,
          content: content,
          metadata: {
            ...metadata,
            language: 'en',
            source_system: 'user_management',
            confidence_score: 0.95
          },
          keywords: keywords,
          tags: tags,
          relationships: relationships,
          summary: summary
        };
      });

      const syncedCount = await this.addDocumentsToVectorStore(enhancedDocuments, 'users');
      const checksum = this.calculateChecksum(changedUsers);
      
      await this.updateSyncStatus('users', checksum, syncedCount, undefined, Date.now() - startTime);
      
      this.logger.log(`Incremental sync completed for ${syncedCount} user documents`);
      return { synced: syncedCount, skipped: false };
    }, 'users');
  }

  /**
   * sync for clients with rich content and metadata - INCREMENTAL VERSION
   */
  async syncClients() {
    return this.syncWithRetry(async () => {
      const startTime = Date.now();
      
      // Get last sync time for incremental sync
      const lastSyncTime = await this.getLastSyncTime('clients');
      
      // Get changes since last sync
      const changedClients = await this.getChangesSince('clients', lastSyncTime);
      
      if (changedClients.length === 0) {
        this.logger.log('No changes detected for clients since last sync, skipping');
        return { synced: 0, skipped: true };
      }

      this.logger.log(`Found ${changedClients.length} client changes since ${lastSyncTime.toISOString()}`);

      const enhancedDocuments: SystemDataDocument[] = changedClients.map(client => {
        const content = this.generateClientContent(client);
        const metadata = this.generateClientMetadata(client);
        const keywords = this.extractClientKeywords(client);
        const tags = this.generateClientTags(client);
        const relationships = this.findClientRelationships(client, changedClients);
        const summary = this.generateClientSummary(client);

        return {
          id: client.id,
          content: content,
          metadata: {
            ...metadata,
            language: 'en',
            source_system: 'client_management',
            confidence_score: 0.95
          },
          keywords: keywords,
          tags: tags,
          relationships: relationships,
          summary: summary
        };
      });

      const syncedCount = await this.addDocumentsToVectorStore(enhancedDocuments, 'clients');
      const checksum = this.calculateChecksum(changedClients);
      
      await this.updateSyncStatus('clients', checksum, syncedCount, undefined, Date.now() - startTime);
      
      this.logger.log(`Incremental sync completed for ${syncedCount} client documents`);
      return { synced: syncedCount, skipped: false };
    }, 'clients');
  }

  /**
   * sync for products with rich content and metadata - INCREMENTAL VERSION
   */
  async syncProducts() {
    return this.syncWithRetry(async () => {
      const startTime = Date.now();
      
      // Get last sync time for incremental sync
      const lastSyncTime = await this.getLastSyncTime('products');
      
      // Get changes since last sync
      const changedProducts = await this.getChangesSince('products', lastSyncTime);
      
      if (changedProducts.length === 0) {
        this.logger.log('No changes detected for products since last sync, skipping');
        return { synced: 0, skipped: true };
      }

      this.logger.log(`Found ${changedProducts.length} product changes since ${lastSyncTime.toISOString()}`);

      const enhancedDocuments: SystemDataDocument[] = changedProducts.map(product => {
        const content = this.generateProductContent(product);
        const metadata = this.generateProductMetadata(product);
        const keywords = this.extractProductKeywords(product);
        const tags = this.generateProductTags(product);
        const relationships = this.findProductRelationships(product, changedProducts);
        const summary = this.generateProductSummary(product);

        return {
          id: product.id,
          content: content,
          metadata: {
            ...metadata,
            language: 'en',
            source_system: 'inventory_management',
            confidence_score: 0.95
          },
          keywords: keywords,
          tags: tags,
          relationships: relationships,
          summary: summary
        };
      });

      const syncedCount = await this.addDocumentsToVectorStore(enhancedDocuments, 'products');
      const checksum = this.calculateChecksum(changedProducts);
      
      await this.updateSyncStatus('products', checksum, syncedCount, undefined, Date.now() - startTime);
      
      this.logger.log(`Incremental sync completed for ${syncedCount} product documents`);
      return { synced: syncedCount, skipped: false };
    }, 'products');
  }

  /**
   * sync for suppliers with rich content and metadata - INCREMENTAL VERSION
   */
  async syncSuppliers() {
    return this.syncWithRetry(async () => {
      const startTime = Date.now();
      
      // Get last sync time for incremental sync
      const lastSyncTime = await this.getLastSyncTime('suppliers');
      
      // Get changes since last sync
      const changedSuppliers = await this.getChangesSince('suppliers', lastSyncTime);
      
      if (changedSuppliers.length === 0) {
        this.logger.log('No changes detected for suppliers since last sync, skipping');
        return { synced: 0, skipped: true };
      }

      this.logger.log(`Found ${changedSuppliers.length} supplier changes since ${lastSyncTime.toISOString()}`);

      const enhancedDocuments: SystemDataDocument[] = changedSuppliers.map(supplier => {
        const content = this.generateSupplierContent(supplier);
        const metadata = this.generateSupplierMetadata(supplier);
        const keywords = this.extractSupplierKeywords(supplier);
        const tags = this.generateSupplierTags(supplier);
        const relationships = this.findSupplierRelationships(supplier, changedSuppliers);
        const summary = this.generateSupplierSummary(supplier);

        return {
          id: supplier.id,
          content: content,
          metadata: {
            ...metadata,
            language: 'en',
            source_system: 'supplier_management',
            confidence_score: 0.95
          },
          keywords: keywords,
          tags: tags,
          relationships: relationships,
          summary: summary
        };
      });

      const syncedCount = await this.addDocumentsToVectorStore(enhancedDocuments, 'suppliers');
      const checksum = this.calculateChecksum(changedSuppliers);
      
      await this.updateSyncStatus('suppliers', checksum, syncedCount, undefined, Date.now() - startTime);
      
      this.logger.log(`Incremental sync completed for ${syncedCount} supplier documents`);
      return { synced: syncedCount, skipped: false };
    }, 'suppliers');
  }

  /**
   * sync for purchases with rich content and metadata - INCREMENTAL VERSION
   */
  async syncPurchases() {
    return this.syncWithRetry(async () => {
      const startTime = Date.now();
      
      // Get last sync time for incremental sync
      const lastSyncTime = await this.getLastSyncTime('purchases');
      
      // Get changes since last sync
      const changedPurchases = await this.getChangesSince('purchases', lastSyncTime);
      
      if (changedPurchases.length === 0) {
        this.logger.log('No changes detected for purchases since last sync, skipping');
        return { synced: 0, skipped: true };
      }

      this.logger.log(`Found ${changedPurchases.length} purchase changes since ${lastSyncTime.toISOString()}`);

      const enhancedDocuments: SystemDataDocument[] = changedPurchases.map(purchase => {
        const content = this.generatePurchaseContent(purchase);
        const metadata = this.generatePurchaseMetadata(purchase);
        const keywords = this.extractPurchaseKeywords(purchase);
        const tags = this.generatePurchaseTags(purchase);
        const relationships = this.findPurchaseRelationships(purchase, changedPurchases);
        const summary = this.generatePurchaseSummary(purchase);

        return {
          id: purchase.id,
          content: content,
          metadata: {
            ...metadata,
            language: 'en',
            source_system: 'purchasing_management',
            confidence_score: 0.95
          },
          keywords: keywords,
          tags: tags,
          relationships: relationships,
          summary: summary
        };
      });

      const syncedCount = await this.addDocumentsToVectorStore(enhancedDocuments, 'purchases');
      const checksum = this.calculateChecksum(changedPurchases);
      
      await this.updateSyncStatus('purchases', checksum, syncedCount, undefined, Date.now() - startTime);
      
      this.logger.log(`Incremental sync completed for ${syncedCount} purchase documents`);
      return { synced: syncedCount, skipped: false };
    }, 'purchases');
  }

  /**
   * sync for invoices with rich content and metadata - INCREMENTAL VERSION
   */
  async syncInvoices() {
    return this.syncWithRetry(async () => {
      const startTime = Date.now();
      
      try {
        // Get last sync time for incremental sync
        const lastSyncTime = await this.getLastSyncTime('invoices');
        
        // Get changes since last sync
        const changedInvoices = await this.getChangesSince('invoices', lastSyncTime);
        
        if (changedInvoices.length === 0) {
          this.logger.log('No changes detected for invoices since last sync, skipping');
          return { synced: 0, skipped: true };
        }

        this.logger.log(`Found ${changedInvoices.length} invoice changes since ${lastSyncTime.toISOString()}`);

        const enhancedDocuments: SystemDataDocument[] = changedInvoices.map(invoice => {
          const content = this.generateInvoiceContent(invoice);
          const metadata = this.generateInvoiceMetadata(invoice);
          const keywords = this.extractInvoiceKeywords(invoice);
          const tags = this.generateInvoiceTags(invoice);
          const relationships = this.findInvoiceRelationships(invoice, changedInvoices);
          const summary = this.generateInvoiceSummary(invoice);

          return {
            id: invoice.id,
            content: content,
            metadata: {
              ...metadata,
              language: 'en',
              source_system: 'sales_management',
              confidence_score: 0.95
            },
            keywords: keywords,
            tags: tags,
            relationships: relationships,
            summary: summary
          };
        });

        const syncedCount = await this.addDocumentsToVectorStore(enhancedDocuments, 'invoices');
        const checksum = this.calculateChecksum(changedInvoices);
        
        await this.updateSyncStatus('invoices', checksum, syncedCount, undefined, Date.now() - startTime);
        
        this.logger.log(`Incremental sync completed for ${syncedCount} invoice documents`);
        return { synced: syncedCount, skipped: false };
      } catch (error) {
        this.logger.error(`Error in syncInvoices: ${error.message}`, error);
        await this.updateSyncStatus('invoices', '', 0, error.message, Date.now() - startTime);
        throw error; // Re-throw to trigger retry mechanism
      }
    }, 'invoices');
  }

  /**
   * sync for ledgers (journal entries) with rich content and metadata
   */
  async syncLedgers() {
    return this.syncWithRetry(async () => {
      const startTime = Date.now();
      
      // Use a placeholder for journal entries since the method doesn't exist
      const allEntries: any[] = []; // TODO: Implement when accounting service has the method
      const hasChanges = await this.hasChanges('ledgers', allEntries);
      
      if (!hasChanges) {
        this.logger.log('No changes detected for ledgers, skipping sync');
        return { synced: 0, skipped: true };
      }

      const enhancedDocuments: SystemDataDocument[] = allEntries.map(entry => {
        const content = this.generateLedgerContent(entry);
        const metadata = this.generateLedgerMetadata(entry);
        const keywords = this.extractLedgerKeywords(entry);
        const tags = this.generateLedgerTags(entry);
        const relationships = this.findLedgerRelationships(entry, allEntries);
        const summary = this.generateLedgerSummary(entry);

        return {
          id: entry.id,
          content: content,
          metadata: {
            ...metadata,
            language: 'en',
            source_system: 'accounting_management',
            confidence_score: 0.95
          },
          keywords: keywords,
          tags: tags,
          relationships: relationships,
          summary: summary
        };
      });

      const syncedCount = await this.addDocumentsToVectorStore(enhancedDocuments, 'ledgers');
      const checksum = this.calculateChecksum(allEntries);
      
      await this.updateSyncStatus('ledgers', checksum, syncedCount, undefined, Date.now() - startTime);
      
      this.logger.log(`sync completed for ${syncedCount} ledger documents`);
      return { synced: syncedCount, skipped: false };
    }, 'ledgers');
  }

  /**
   * sync for account balances with rich content and metadata
   */
  async syncBalances() {
    return this.syncWithRetry(async () => {
      const startTime = Date.now();
      
      // Use a placeholder for accounts since the method doesn't exist
      const allAccounts: any[] = []; // TODO: Implement when accounting service has the method
      const hasChanges = await this.hasChanges('balances', allAccounts);
      
      if (!hasChanges) {
        this.logger.log('No changes detected for balances, skipping sync');
        return { synced: 0, skipped: true };
      }

      const enhancedDocuments: SystemDataDocument[] = allAccounts.map(account => {
        const content = this.generateBalanceContent(account);
        const metadata = this.generateBalanceMetadata(account);
        const keywords = this.extractBalanceKeywords(account);
        const tags = this.generateBalanceTags(account);
        const relationships = this.findBalanceRelationships(account, allAccounts);
        const summary = this.generateBalanceSummary(account);

        return {
          id: account.id,
          content: content,
          metadata: {
            ...metadata,
            language: 'en',
            source_system: 'accounting_management',
            confidence_score: 0.95
          },
          keywords: keywords,
          tags: tags,
          relationships: relationships,
          summary: summary
        };
      });

      const syncedCount = await this.addDocumentsToVectorStore(enhancedDocuments, 'balances');
      const checksum = this.calculateChecksum(allAccounts);
      
      await this.updateSyncStatus('balances', checksum, syncedCount, undefined, Date.now() - startTime);
      
      this.logger.log(`sync completed for ${syncedCount} balance documents`);
      return { synced: syncedCount, skipped: false };
    }, 'balances');
  }

  /**
   * sync for system features and capabilities with rich content and metadata
   */
  async syncSystemFeatures() {
    return this.syncWithRetry(async () => {
      const startTime = Date.now();
      
      const systemFeatures = [
        {
          id: 'ai-agent',
          name: 'AI Agent',
          description: 'Natural language interface for business intelligence',
          capabilities: ['Query processing', 'Semantic search', 'Data analysis']
        },
        {
          id: 'inventory-management',
          name: 'Inventory Management',
          description: 'Product and stock management system',
          capabilities: ['Product tracking', 'Stock movements', 'Batch management']
        },
        {
          id: 'sales-management',
          name: 'Sales Management',
          description: 'Invoice and payment processing',
          capabilities: ['Invoice creation', 'Payment tracking', 'Client management']
        },
        {
          id: 'purchasing',
          name: 'Purchasing',
          description: 'Supplier and purchase order management',
          capabilities: ['Supplier management', 'Purchase orders', 'Order tracking']
        },
        {
          id: 'accounting',
          name: 'Accounting',
          description: 'Financial management and reporting',
          capabilities: ['Journal entries', 'Account management', 'Financial reports']
        }
      ];

      const enhancedDocuments: SystemDataDocument[] = systemFeatures.map(feature => {
        const content = this.generateSystemFeatureContent(feature);
        const metadata = this.generateSystemFeatureMetadata(feature);
        const keywords = this.extractSystemFeatureKeywords(feature);
        const tags = this.generateSystemFeatureTags(feature);
        const relationships = this.findSystemFeatureRelationships(feature, systemFeatures);
        const summary = this.generateSystemFeatureSummary(feature);

        return {
          id: feature.id,
          content: content,
          metadata: {
            ...metadata,
            language: 'en',
            source_system: 'system_management',
            confidence_score: 0.95
          },
          keywords: keywords,
          tags: tags,
          relationships: relationships,
          summary: summary
        };
      });

      const syncedCount = await this.addDocumentsToVectorStore(enhancedDocuments, 'system_features');
      const checksum = this.calculateChecksum(systemFeatures);
      
      await this.updateSyncStatus('system_features', checksum, syncedCount, undefined, Date.now() - startTime);
      
      this.logger.log(`sync completed for ${syncedCount} system feature documents`);
      return { synced: syncedCount, skipped: false };
    }, 'system_features');
  }

  /**
   * Sync all data with content and metadata - INCREMENTAL VERSION
   */
  async syncAllData() {
    this.logger.log('Starting incremental sync of all data with rich content and metadata...');
    const startTime = Date.now();

    const syncResults = await Promise.allSettled([
      this.syncUsers(),
      this.syncClients(),
      this.syncProducts(),
      this.syncSuppliers(),
      this.syncPurchases(),
      this.syncInvoices(),
      this.syncLedgers(),
      this.syncBalances(),
      this.syncSystemFeatures()
    ]);

    const totalTime = Date.now() - startTime;
    let totalSynced = 0;
    let totalSkipped = 0;

    syncResults.forEach((result, index) => {
      const entityTypes = ['users', 'clients', 'products', 'suppliers', 'purchases', 'invoices', 'ledgers', 'balances', 'system_features'];
      const entityType = entityTypes[index];
      
      if (result.status === 'fulfilled' && result.value) {
        if (result.value.skipped) {
          totalSkipped++;
          this.logger.log(`${entityType}: No changes since last sync, incremental sync skipped`);
        } else {
          totalSynced += result.value.synced;
          this.logger.log(`${entityType}: Incremental sync completed for ${result.value.synced} documents`);
        }
      } else {
        this.logger.error(`${entityType}: Incremental sync failed`, result.status === 'rejected' ? result.reason : 'Unknown error');
      }
    });

    this.logger.log(`Incremental sync completed in ${totalTime}ms. Synced: ${totalSynced}, Skipped: ${totalSkipped}`);
    return { totalSynced, totalSkipped, totalTime };
  }

  /**
   * Force full sync of all data (ignores last sync time)
   */
  async forceFullSyncAllData() {
    this.logger.log('Starting FORCED FULL sync of all data...');
    const startTime = Date.now();

    // Clear all sync statuses to force full sync
    this.clearAllStatuses();
    await this.loadSyncStatus();

    const syncResults = await Promise.allSettled([
      this.syncUsers(),
      this.syncClients(),
      this.syncProducts(),
      this.syncSuppliers(),
      this.syncPurchases(),
      this.syncInvoices(),
      this.syncLedgers(),
      this.syncBalances(),
      this.syncSystemFeatures()
    ]);

    const totalTime = Date.now() - startTime;
    let totalSynced = 0;
    let totalSkipped = 0;

    syncResults.forEach((result, index) => {
      const entityTypes = ['users', 'clients', 'products', 'suppliers', 'purchases', 'invoices', 'ledgers', 'balances', 'system_features'];
      const entityType = entityTypes[index];
      
      if (result.status === 'fulfilled' && result.value) {
        if (result.value.skipped) {
          totalSkipped++;
          this.logger.log(`${entityType}: No data found, full sync skipped`);
        } else {
          totalSynced += result.value.synced;
          this.logger.log(`${entityType}: Full sync completed for ${result.value.synced} documents`);
        }
      } else {
        this.logger.error(`${entityType}: Full sync failed`, result.status === 'rejected' ? result.reason : 'Unknown error');
      }
    });

    this.logger.log(`Full sync completed in ${totalTime}ms. Synced: ${totalSynced}, Skipped: ${totalSkipped}`);
    return { totalSynced, totalSkipped, totalTime };
  }

  /**
   * Force full sync of a specific entity type
   */
  async forceFullSyncEntity(entityType: string) {
    this.logger.log(`Starting FORCED FULL sync for ${entityType}...`);
    
    // Clear sync status for this entity type
    this.syncStatusMap.delete(entityType);
    
    const syncMethod = `sync${entityType.charAt(0).toUpperCase() + entityType.slice(1)}` as keyof SyncService;
    
    if (typeof this[syncMethod] === 'function') {
      const result = await this.syncWithRetry(
        () => (this[syncMethod] as () => Promise<any>)(),
        entityType
      );
      return result;
    }
    
    throw new Error(`No sync method found for entity type: ${entityType}`);
  }



  /**
   * Add documents to vector store with batch processing
   */
  private async addDocumentsToVectorStore(
    documents: SystemDataDocument[],
    entityType: string
  ): Promise<number> {
    if (!documents.length) return 0;

    try {
      // Remove existing documents for this entity type
      await this.vectorStoreService.removeDocumentsByEntityType(entityType);

      // Convert documents to vector store format
      const vectorDocs = documents.map(doc => ({
        id: doc.id,
        content: doc.content,
        metadata: {
          ...doc.metadata,
          keywords: doc.keywords.join(','),
          tags: doc.tags.join(','),
          relationships: JSON.stringify(doc.relationships),
          summary: doc.summary
        }
      }));

      // Add to vector store in batches
      const batchSize = 50;
      const batches = this.chunkArray(vectorDocs, batchSize);
      let totalAdded = 0;

      for (const batch of batches) {
        const added = await this.vectorStoreService.addDocuments(batch, entityType);
        totalAdded += added;
      }

      this.logger.log(`Added ${totalAdded} documents to vector store for ${entityType}`);
      return totalAdded;
    } catch (error) {
      this.logger.error(`Error adding documents to vector store for ${entityType}`, error);
      throw error;
    }
  }

  /**
   * Utility function to chunk arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }


  // ==================== CONTENT GENERATION METHODS ====================

  private generateUserContent(user: any): string {
    const roles = user.roles?.join(', ') || 'No role assigned';
    const status = user.status || 'Active';
    const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never';
    const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';

    return `
User Profile: ${user.username}
Full Name: ${user.firstName || ''} ${user.lastName || ''}
Email Address: ${user.email}
Contact Information: ${user.phone || 'Not provided'}
Role and Permissions: ${roles}
Account Status: ${status}
Account Creation: ${createdAt}
Last Login Activity: ${lastLogin}
Department: ${user.department || 'Not assigned'}
Location: ${user.location || 'Not specified'}
Account Type: ${user.accountType || 'Standard'}
Profile Completion: ${this.calculateProfileCompletion(user)}%
${user.bio ? `Bio: ${user.bio}` : ''}
${user.skills ? `Skills: ${user.skills.join(', ')}` : ''}
`.trim();
  }

  private generateClientContent(client: any): string {
    const status = client.status || 'Active';
    const createdAt = client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'Unknown';
    const lastContact = client.lastContact ? new Date(client.lastContact).toLocaleDateString() : 'No contact history';

    return `
Client Profile: ${client.name}
Contact Information:
  - Email: ${client.email}
  - Phone: ${client.phone || 'Not provided'}
  - Address: ${client.address || 'Not provided'}
  - City: ${client.city || 'Not specified'}
  - Country: ${client.country || 'Not specified'}
Business Details:
  - Company Type: ${client.companyType || 'Not specified'}
  - Industry: ${client.industry || 'Not specified'}
  - Tax ID: ${client.taxId || 'Not provided'}
Account Status: ${status}
Client Since: ${createdAt}
Last Contact: ${lastContact}
Credit Limit: ${client.creditLimit ? `$${client.creditLimit}` : 'Not set'}
Payment Terms: ${client.paymentTerms || 'Standard'}
Notes: ${client.notes || 'No additional notes'}
`.trim();
  }

  private generateProductContent(product: any): string {
    const status = product.status || 'Active';
    const createdAt = product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Unknown';
    const stockStatus = product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock';
    const reorderPoint = product.reorderPoint || 'Not set';

    return `
Product Information: ${product.name}
Product Details:
  - SKU: ${product.sku}
  - Category: ${product.category}
  - Brand: ${product.brand || 'Not specified'}
  - Model: ${product.model || 'Not specified'}
Pricing Information:
  - Cost Price: $${product.costPrice || 'Not set'}
  - Selling Price: $${product.price}
  - Profit Margin: ${this.calculateProfitMargin(product)}%
Inventory Status:
  - Current Stock: ${product.stockQuantity} units
  - Stock Status: ${stockStatus}
  - Reorder Point: ${reorderPoint}
  - Maximum Stock: ${product.maxStock || 'Not set'}
Product Specifications:
  - Weight: ${product.weight || 'Not specified'}
  - Dimensions: ${product.dimensions || 'Not specified'}
  - Color: ${product.color || 'Not specified'}
  - Material: ${product.material || 'Not specified'}
Product Status: ${status}
Date Added: ${createdAt}
Description: ${product.description || 'No description available'}
${product.features ? `Features: ${product.features.join(', ')}` : ''}
`.trim();
  }

  private generateInvoiceContent(invoice: IInvoice): string {
    const status = invoice.paymentStatus || 'Pending';
    const issueDate = invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'Not set';
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Not set';
    const createdDate = invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'Not paid';

    return `
Invoice Details: ${invoice.invoiceNumber}
Client Information:
  - Client Name: ${invoice.clientName || 'Unknown'}
  - Client Email: ${invoice.clientEmail || 'Not provided'}
  - Client Phone: ${invoice.clientPhone || 'Not provided'}
Financial Information:
  - Subtotal: $${invoice.subtotal || 0}
  - Tax Amount: $${invoice.taxAmount || 0}
  - Discount: $${invoice.discountAmount || 0}
  - Total Amount: $${invoice.totalAmount}
  - Amount Paid: $${invoice.paidAmount || 0}
  - Balance Due: $${(invoice.totalAmount - (invoice.paidAmount || 0)).toFixed(2)}
Invoice Timeline:
  - Issue Date: ${issueDate}
  - Due Date: ${dueDate}
  - Created Date: ${createdDate}
Payment Status: ${status}
Payment Method: ${invoice.paymentStatus || 'Not specified'}
Invoice Items: ${invoice.items?.length || 0} items
Notes: ${invoice.notes || 'No additional notes'}
Terms and Conditions: ${invoice.paymentTerms || 'Standard terms apply'}
`.trim();
  }

  private generateSupplierContent(supplier: any): string {
    const status = supplier.status || 'Active';
    const createdAt = supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : 'Unknown';
    const lastContact = supplier.lastContact ? new Date(supplier.lastContact).toLocaleDateString() : 'No contact history';

    return `
Supplier Profile: ${supplier.name}
Contact Information:
  - Contact Person: ${supplier.contactPerson || 'Not specified'}
  - Email: ${supplier.email}
  - Phone: ${supplier.phone || 'Not provided'}
  - Address: ${supplier.address || 'Not provided'}
  - City: ${supplier.city || 'Not specified'}
  - Country: ${supplier.country || 'Not specified'}
Business Details:
  - Company Type: ${supplier.companyType || 'Not specified'}
  - Industry: ${supplier.industry || 'Not specified'}
  - Tax ID: ${supplier.taxId || 'Not provided'}
  - Website: ${supplier.website || 'Not provided'}
Account Status: ${status}
Supplier Since: ${createdAt}
Last Contact: ${lastContact}
Payment Terms: ${supplier.paymentTerms || 'Standard'}
Credit Limit: ${supplier.creditLimit ? `$${supplier.creditLimit}` : 'Not set'}
Notes: ${supplier.notes || 'No additional notes'}
`.trim();
  }

  private generatePurchaseContent(purchase: IPurchase): string {
    const status = purchase.purchaseStatus || 'Pending';
    const orderDate = purchase.orderDate ? new Date(purchase.orderDate).toLocaleDateString() : 'Not set';
    const expectedDelivery = purchase.expectedDeliveryDate ? new Date(purchase.expectedDeliveryDate).toLocaleDateString() : 'Not set';

    return `
Purchase Order: ${purchase.purchaseNumber}
Supplier Information:
  - Supplier Name: ${purchase.supplierName || 'Unknown'}
  - Supplier Email: ${purchase.supplierEmail || 'Not provided'}
  - Supplier Phone: ${purchase.supplierPhone || 'Not provided'}
Order Details:
  - Order Date: ${orderDate}
  - Expected Delivery: ${expectedDelivery}
  - Delivery Address: ${purchase.supplierAddress || 'Not specified'}
Financial Information:
  - Subtotal: $${purchase.subtotal || 0}
  - Tax Amount: $${purchase.taxAmount || 0}
  - Shipping Cost: $${purchase.shippingCost || 0}
  - Total Amount: $${purchase.totalAmount}
Order Status: ${status}
Payment Status: ${purchase.paymentStatus || 'Pending'}
Order Items: ${purchase.items?.length || 0} items
Notes: ${purchase.notes || 'No additional notes'}
Terms and Conditions: ${purchase.supplierPaymentTerms || 'Standard terms apply'}
`.trim();
  }

  private generateLedgerContent(entry: any): string {
    const date = entry.date ? new Date(entry.date).toLocaleDateString() : 'Not set';
    const status = entry.status || 'Posted';

    return `
Journal Entry: ${entry.reference}
Entry Details:
  - Date: ${date}
  - Description: ${entry.description || 'No description'}
  - Reference: ${entry.reference}
  - Entry Type: ${entry.entryType || 'General'}
Financial Information:
  - Total Amount: $${entry.totalAmount || 0}
  - Debit Amount: $${entry.debitAmount || 0}
  - Credit Amount: $${entry.creditAmount || 0}
Entry Status: ${status}
Posting Date: ${entry.postingDate ? new Date(entry.postingDate).toLocaleDateString() : 'Not posted'}
Notes: ${entry.notes || 'No additional notes'}
`.trim();
  }

  private generateBalanceContent(account: any): string {
    const status = account.status || 'Active';
    const balance = account.balance || 0;
    const balanceType = balance >= 0 ? 'Credit' : 'Debit';

    return `
Account: ${account.name}
Account Details:
  - Account Code: ${account.code}
  - Account Type: ${account.type}
  - Account Category: ${account.category || 'General'}
  - Account Status: ${status}
Financial Information:
  - Current Balance: $${balance}
  - Balance Type: ${balanceType}
  - Opening Balance: $${account.openingBalance || 0}
  - Credit Limit: $${account.creditLimit || 'Not set'}
Account Information:
  - Description: ${account.description || 'No description'}
  - Currency: ${account.currency || 'USD'}
  - Last Transaction: ${account.lastTransaction ? new Date(account.lastTransaction).toLocaleDateString() : 'No transactions'}
Notes: ${account.notes || 'No additional notes'}
`.trim();
  }

  private generateSystemFeatureContent(feature: any): string {
    return `
System Feature: ${feature.name}
Feature Details:
  - Description: ${feature.description}
  - Feature ID: ${feature.id}
  - Status: ${feature.status || 'Active'}
Capabilities:
  - ${feature.capabilities.join('\n  - ')}
Technical Information:
  - Version: ${feature.version || '1.0'}
  - Category: ${feature.category || 'General'}
  - Dependencies: ${feature.dependencies?.join(', ') || 'None'}
Usage Information:
  - Access Level: ${feature.accessLevel || 'Standard'}
  - Documentation: ${feature.documentation || 'Available'}
Notes: ${feature.notes || 'No additional notes'}
`.trim();
  }

  // ==================== METADATA GENERATION METHODS ====================

  private generateUserMetadata(user: any): DocumentMetadata {
    return {
      entity_type: 'users',
      entity_id: user.id,
      title: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      description: `User account for ${user.email} with role ${user.roles?.join(', ') || 'No role'}`,
      status: user.status || 'Active',
      priority: this.determineUserPriority(user),
      category: user.department || 'General',
      created_at: user.createdAt || new Date().toISOString(),
      updated_at: user.updatedAt || new Date().toISOString(),
      created_by: user.createdBy || 'system',
      last_modified_by: user.lastModifiedBy || 'system',
      version: 1,
      is_active: user.status !== 'Inactive',
      language: 'en',
      source_system: 'user_management',
      confidence_score: 0.95,
      // Additional user-specific metadata
      email: user.email,
      username: user.username,
      roles: user.roles,
      department: user.department,
      location: user.location,
      account_type: user.accountType,
      profile_completion: this.calculateProfileCompletion(user),
      last_login: user.lastLogin,
      phone: user.phone,
      skills: user.skills
    };
  }

  private generateClientMetadata(client: any): DocumentMetadata {
    return {
      entity_type: 'clients',
      entity_id: client.id,
      title: client.name,
      description: `Client account for ${client.name} in ${client.industry || 'General'} industry`,
      status: client.status || 'Active',
      priority: this.determineClientPriority(client),
      category: client.industry || 'General',
      created_at: client.createdAt || new Date().toISOString(),
      updated_at: client.updatedAt || new Date().toISOString(),
      created_by: client.createdBy || 'system',
      last_modified_by: client.lastModifiedBy || 'system',
      version: 1,
      is_active: client.status !== 'Inactive',
      language: 'en',
      source_system: 'client_management',
      confidence_score: 0.95,
      // Additional client-specific metadata
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      country: client.country,
      company_type: client.companyType,
      industry: client.industry,
      tax_id: client.taxId,
      credit_limit: client.creditLimit,
      payment_terms: client.paymentTerms,
      last_contact: client.lastContact
    };
  }

  private generateProductMetadata(product: any): DocumentMetadata {
    return {
      entity_type: 'products',
      entity_id: product.id,
      title: product.name,
      description: `${product.name} - ${product.category} product with SKU ${product.sku}`,
      status: product.status || 'Active',
      priority: this.determineProductPriority(product),
      category: product.category,
      created_at: product.createdAt || new Date().toISOString(),
      updated_at: product.updatedAt || new Date().toISOString(),
      created_by: product.createdBy || 'system',
      last_modified_by: product.lastModifiedBy || 'system',
      version: 1,
      is_active: product.status !== 'Inactive',
      language: 'en',
      source_system: 'inventory_management',
      confidence_score: 0.95,
      // Additional product-specific metadata
      sku: product.sku,
      brand: product.brand,
      model: product.model,
      cost_price: product.costPrice,
      selling_price: product.price,
      stock_quantity: product.stockQuantity,
      reorder_point: product.reorderPoint,
      max_stock: product.maxStock,
      weight: product.weight,
      dimensions: product.dimensions,
      color: product.color,
      material: product.material,
      profit_margin: this.calculateProfitMargin(product)
    };
  }

  private generateInvoiceMetadata(invoice: any): DocumentMetadata {
    return {
      entity_type: 'invoices',
      entity_id: invoice.id,
      title: `Invoice ${invoice.invoiceNumber}`,
      description: `Invoice for ${invoice.client?.name || 'Unknown'} totaling $${invoice.totalAmount}`,
      status: invoice.paymentStatus || 'Pending',
      priority: this.determineInvoicePriority(invoice),
      category: 'Sales',
      created_at: invoice.createdAt || new Date().toISOString(),
      updated_at: invoice.updatedAt || new Date().toISOString(),
      created_by: invoice.createdBy || 'system',
      last_modified_by: invoice.lastModifiedBy || 'system',
      version: 1,
      is_active: invoice.paymentStatus !== 'Cancelled',
      language: 'en',
      source_system: 'sales_management',
      confidence_score: 0.95,
      // Additional invoice-specific metadata
      invoice_number: invoice.invoiceNumber,
      client_id: invoice.clientId,
      client_name: invoice.client?.name,
      subtotal: invoice.subtotal,
      tax_amount: invoice.taxAmount,
      discount_amount: invoice.discountAmount,
      total_amount: invoice.totalAmount,
      amount_paid: invoice.amountPaid,
      balance_due: invoice.totalAmount - (invoice.amountPaid || 0),
      issue_date: invoice.issueDate,
      due_date: invoice.dueDate,
      paid_date: invoice.paidDate,
      payment_method: invoice.paymentMethod,
      item_count: invoice.items?.length || 0
    };
  }

  private generateSupplierMetadata(supplier: any): DocumentMetadata {
    return {
      entity_type: 'suppliers',
      entity_id: supplier.id,
      title: supplier.name,
      description: `Supplier account for ${supplier.name} in ${supplier.industry || 'General'} industry`,
      status: supplier.status || 'Active',
      priority: this.determineSupplierPriority(supplier),
      category: supplier.industry || 'General',
      created_at: supplier.createdAt || new Date().toISOString(),
      updated_at: supplier.updatedAt || new Date().toISOString(),
      created_by: supplier.createdBy || 'system',
      last_modified_by: supplier.lastModifiedBy || 'system',
      version: 1,
      is_active: supplier.status !== 'Inactive',
      language: 'en',
      source_system: 'supplier_management',
      confidence_score: 0.95,
      // Additional supplier-specific metadata
      name: supplier.name,
      contact_person: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
      country: supplier.country,
      company_type: supplier.companyType,
      industry: supplier.industry,
      tax_id: supplier.taxId,
      website: supplier.website,
      payment_terms: supplier.paymentTerms,
      credit_limit: supplier.creditLimit,
      last_contact: supplier.lastContact
    };
  }

  private generatePurchaseMetadata(purchase: any): DocumentMetadata {
    return {
      entity_type: 'purchases',
      entity_id: purchase.id,
      title: `Purchase Order ${purchase.orderNumber}`,
      description: `Purchase order from ${purchase.supplier?.name || 'Unknown'} totaling $${purchase.totalAmount}`,
      status: purchase.status || 'Pending',
      priority: this.determinePurchasePriority(purchase),
      category: 'Purchasing',
      created_at: purchase.createdAt || new Date().toISOString(),
      updated_at: purchase.updatedAt || new Date().toISOString(),
      created_by: purchase.createdBy || 'system',
      last_modified_by: purchase.lastModifiedBy || 'system',
      version: 1,
      is_active: purchase.status !== 'Cancelled',
      language: 'en',
      source_system: 'purchasing_management',
      confidence_score: 0.95,
      // Additional purchase-specific metadata
      order_number: purchase.orderNumber,
      supplier_id: purchase.supplierId,
      supplier_name: purchase.supplier?.name,
      subtotal: purchase.subtotal,
      tax_amount: purchase.taxAmount,
      shipping_cost: purchase.shippingCost,
      total_amount: purchase.totalAmount,
      order_date: purchase.orderDate,
      expected_delivery: purchase.expectedDelivery,
      delivery_address: purchase.deliveryAddress,
      payment_status: purchase.paymentStatus,
      item_count: purchase.items?.length || 0
    };
  }

  private generateLedgerMetadata(entry: any): DocumentMetadata {
    return {
      entity_type: 'ledgers',
      entity_id: entry.id,
      title: `Journal Entry ${entry.reference}`,
      description: `Journal entry for ${entry.description || 'General'} totaling $${entry.totalAmount || 0}`,
      status: entry.status || 'Posted',
      priority: this.determineLedgerPriority(entry),
      category: 'Accounting',
      created_at: entry.createdAt || new Date().toISOString(),
      updated_at: entry.updatedAt || new Date().toISOString(),
      created_by: entry.createdBy || 'system',
      last_modified_by: entry.lastModifiedBy || 'system',
      version: 1,
      is_active: entry.status !== 'Cancelled',
      language: 'en',
      source_system: 'accounting_management',
      confidence_score: 0.95,
      // Additional ledger-specific metadata
      reference: entry.reference,
      date: entry.date,
      entry_description: entry.description,
      entry_type: entry.entryType,
      total_amount: entry.totalAmount,
      debit_amount: entry.debitAmount,
      credit_amount: entry.creditAmount,
      posting_date: entry.postingDate,
      notes: entry.notes
    };
  }

  private generateBalanceMetadata(account: any): DocumentMetadata {
    return {
      entity_type: 'balances',
      entity_id: account.id,
      title: `Account ${account.name}`,
      description: `${account.type} account with balance $${account.balance || 0}`,
      status: account.status || 'Active',
      priority: this.determineBalancePriority(account),
      category: 'Accounting',
      created_at: account.createdAt || new Date().toISOString(),
      updated_at: account.updatedAt || new Date().toISOString(),
      created_by: account.createdBy || 'system',
      last_modified_by: account.lastModifiedBy || 'system',
      version: 1,
      is_active: account.status !== 'Inactive',
      language: 'en',
      source_system: 'accounting_management',
      confidence_score: 0.95,
      // Additional balance-specific metadata
      name: account.name,
      code: account.code,
      type: account.type,
      account_category: account.category,
      balance: account.balance,
      opening_balance: account.openingBalance,
      credit_limit: account.creditLimit,
      currency: account.currency,
      last_transaction: account.lastTransaction,
      notes: account.notes
    };
  }

  private generateSystemFeatureMetadata(feature: any): DocumentMetadata {
    return {
      entity_type: 'system_features',
      entity_id: feature.id,
      title: feature.name,
      description: feature.description,
      status: feature.status || 'Active',
      priority: this.determineSystemFeaturePriority(feature),
      category: 'System',
      created_at: feature.createdAt || new Date().toISOString(),
      updated_at: feature.updatedAt || new Date().toISOString(),
      created_by: feature.createdBy || 'system',
      last_modified_by: feature.lastModifiedBy || 'system',
      version: feature.version || 1,
      is_active: feature.status !== 'Inactive',
      language: 'en',
      source_system: 'system_management',
      confidence_score: 0.95,
      // Additional system feature-specific metadata
      name: feature.name,
      feature_description: feature.description,
      capabilities: feature.capabilities,
      feature_category: feature.category,
      dependencies: feature.dependencies,
      access_level: feature.accessLevel,
      documentation: feature.documentation,
      notes: feature.notes
    };
  }

  // ==================== KEYWORD EXTRACTION METHODS ====================

  private extractUserKeywords(user: any): string[] {
    const keywords = [
      user.username,
      user.firstName,
      user.lastName,
      user.email,
      ...(user.roles || []),
      user.department,
      user.location,
      user.accountType,
      user.status,
      'user',
      'account',
      'profile',
      'employee',
      'staff',
      'member'
    ].filter(Boolean);

    return [...new Set(keywords.map(k => k.toLowerCase()))];
  }

  private extractClientKeywords(client: any): string[] {
    const keywords = [
      client.name,
      client.email,
      client.phone,
      client.address,
      client.city,
      client.country,
      client.companyType,
      client.industry,
      client.status,
      'client',
      'customer',
      'company',
      'business',
      'account'
    ].filter(Boolean);

    return [...new Set(keywords.map(k => k.toLowerCase()))];
  }

  private extractProductKeywords(product: any): string[] {
    const keywords = [
      product.name,
      product.sku,
      product.category,
      product.brand,
      product.model,
      product.color,
      product.material,
      product.status,
      'product',
      'item',
      'inventory',
      'stock',
      'goods',
      'merchandise'
    ].filter(Boolean);

    return [...new Set(keywords.map(k => k.toLowerCase()))];
  }

  private extractInvoiceKeywords(invoice: any): string[] {
    const keywords = [
      invoice.invoiceNumber,
      invoice.client?.name,
      invoice.paymentStatus,
      invoice.paymentMethod,
      'invoice',
      'bill',
      'payment',
      'receipt',
      'transaction',
      'sale',
      'order'
    ].filter(Boolean);

    return [...new Set(keywords.map(k => k.toLowerCase()))];
  }

  private extractSupplierKeywords(supplier: any): string[] {
    const keywords = [
      supplier.name,
      supplier.contactPerson,
      supplier.email,
      supplier.phone,
      supplier.address,
      supplier.city,
      supplier.country,
      supplier.companyType,
      supplier.industry,
      supplier.status,
      'supplier',
      'vendor',
      'provider',
      'company',
      'business'
    ].filter(Boolean);

    return [...new Set(keywords.map(k => k.toLowerCase()))];
  }

  private extractPurchaseKeywords(purchase: any): string[] {
    const keywords = [
      purchase.orderNumber,
      purchase.supplier?.name,
      purchase.status,
      purchase.paymentStatus,
      'purchase',
      'order',
      'po',
      'procurement',
      'buying',
      'supplier'
    ].filter(Boolean);

    return [...new Set(keywords.map(k => k.toLowerCase()))];
  }

  private extractLedgerKeywords(entry: any): string[] {
    const keywords = [
      entry.reference,
      entry.description,
      entry.entryType,
      entry.status,
      'journal',
      'entry',
      'ledger',
      'accounting',
      'debit',
      'credit',
      'posting'
    ].filter(Boolean);

    return [...new Set(keywords.map(k => k.toLowerCase()))];
  }

  private extractBalanceKeywords(account: any): string[] {
    const keywords = [
      account.name,
      account.code,
      account.type,
      account.category,
      account.status,
      'account',
      'balance',
      'financial',
      'accounting',
      'ledger'
    ].filter(Boolean);

    return [...new Set(keywords.map(k => k.toLowerCase()))];
  }

  private extractSystemFeatureKeywords(feature: any): string[] {
    const keywords = [
      feature.name,
      feature.description,
      feature.category,
      feature.status,
      ...feature.capabilities,
      'system',
      'feature',
      'capability',
      'functionality'
    ].filter(Boolean);

    return [...new Set(keywords.map(k => k.toLowerCase()))];
  }

  // ==================== TAG GENERATION METHODS ====================

  private generateUserTags(user: any): string[] {
    const tags = ['user', 'account'];

    if (user.roles?.includes('admin')) tags.push('admin', 'administrator');
    if (user.roles?.includes('manager')) tags.push('manager', 'management');
    if (user.status === 'Active') tags.push('active');
    if (user.status === 'Inactive') tags.push('inactive');
    if (user.department) tags.push(user.department.toLowerCase());
    if (user.accountType) tags.push(user.accountType.toLowerCase());

    return tags;
  }

  private generateClientTags(client: any): string[] {
    const tags = ['client', 'customer'];

    if (client.status === 'Active') tags.push('active');
    if (client.status === 'Inactive') tags.push('inactive');
    if (client.industry) tags.push(client.industry.toLowerCase());
    if (client.companyType) tags.push(client.companyType.toLowerCase());
    if (client.creditLimit) tags.push('credit-approved');

    return tags;
  }

  private generateProductTags(product: any): string[] {
    const tags = ['product', 'inventory'];

    if (product.stockQuantity > 0) tags.push('in-stock');
    if (product.stockQuantity === 0) tags.push('out-of-stock');
    if (product.stockQuantity <= (product.reorderPoint || 0)) tags.push('low-stock');
    if (product.category) tags.push(product.category.toLowerCase());
    if (product.brand) tags.push(product.brand.toLowerCase());
    if (product.status === 'Active') tags.push('active');

    return tags;
  }

  private generateInvoiceTags(invoice: any): string[] {
    const tags = ['invoice', 'transaction'];

    if (invoice.paymentStatus === 'Paid') tags.push('paid', 'completed');
    if (invoice.paymentStatus === 'Pending') tags.push('pending', 'unpaid');
    if (invoice.paymentStatus === 'Overdue') tags.push('overdue', 'late');
    if (invoice.totalAmount > 1000) tags.push('high-value');
    if (invoice.totalAmount < 100) tags.push('low-value');

    return tags;
  }

  private generateSupplierTags(supplier: any): string[] {
    const tags = ['supplier', 'vendor'];

    if (supplier.status === 'Active') tags.push('active');
    if (supplier.status === 'Inactive') tags.push('inactive');
    if (supplier.industry) tags.push(supplier.industry.toLowerCase());
    if (supplier.companyType) tags.push(supplier.companyType.toLowerCase());
    if (supplier.creditLimit) tags.push('credit-approved');

    return tags;
  }

  private generatePurchaseTags(purchase: any): string[] {
    const tags = ['purchase', 'order'];

    if (purchase.status === 'Completed') tags.push('completed', 'delivered');
    if (purchase.status === 'Pending') tags.push('pending', 'processing');
    if (purchase.status === 'Cancelled') tags.push('cancelled');
    if (purchase.totalAmount > 1000) tags.push('high-value');
    if (purchase.totalAmount < 100) tags.push('low-value');

    return tags;
  }

  private generateLedgerTags(entry: any): string[] {
    const tags = ['ledger', 'journal', 'entry'];

    if (entry.status === 'Posted') tags.push('posted', 'confirmed');
    if (entry.status === 'Pending') tags.push('pending', 'draft');
    if (entry.status === 'Cancelled') tags.push('cancelled');
    if (entry.totalAmount > 10000) tags.push('high-value');
    if (entry.totalAmount < 100) tags.push('low-value');
    if (entry.entryType) tags.push(entry.entryType.toLowerCase());

    return tags;
  }

  private generateBalanceTags(account: any): string[] {
    const tags = ['account', 'balance'];

    if (account.status === 'Active') tags.push('active');
    if (account.status === 'Inactive') tags.push('inactive');
    if (account.type) tags.push(account.type.toLowerCase());
    if (account.category) tags.push(account.category.toLowerCase());
    if (account.balance > 10000) tags.push('high-balance');
    if (account.balance < 0) tags.push('negative-balance');

    return tags;
  }

  private generateSystemFeatureTags(feature: any): string[] {
    const tags = ['system', 'feature'];

    if (feature.status === 'Active') tags.push('active');
    if (feature.status === 'Inactive') tags.push('inactive');
    if (feature.category) tags.push(feature.category.toLowerCase());
    if (feature.accessLevel) tags.push(feature.accessLevel.toLowerCase());
    if (feature.capabilities?.length > 5) tags.push('complex');
    if (feature.capabilities?.length <= 2) tags.push('simple');

    return tags;
  }

  // ==================== RELATIONSHIP FINDING METHODS ====================

  private findUserRelationships(user: any, allUsers: any[]): Relationship[] {
    const relationships: Relationship[] = [];

    // Find users in same department
    const sameDepartment = allUsers.filter(u =>
      u.id !== user.id && u.department === user.department
    );

    sameDepartment.forEach(u => {
      relationships.push({
        type: 'related',
        entity_type: 'users',
        entity_id: u.id,
        strength: 0.7,
        description: `Same department: ${user.department}`
      });
    });

    return relationships;
  }

  private findClientRelationships(client: any, allClients: any[]): Relationship[] {
    const relationships: Relationship[] = [];

    // Find clients in same industry
    const sameIndustry = allClients.filter(c =>
      c.id !== client.id && c.industry === client.industry
    );

    sameIndustry.forEach(c => {
      relationships.push({
        type: 'related',
        entity_type: 'clients',
        entity_id: c.id,
        strength: 0.6,
        description: `Same industry: ${client.industry}`
      });
    });

    return relationships;
  }

  private findProductRelationships(product: any, allProducts: any[]): Relationship[] {
    const relationships: Relationship[] = [];

    // Find products in same category
    const sameCategory = allProducts.filter(p =>
      p.id !== product.id && p.category === product.category
    );

    sameCategory.forEach(p => {
      relationships.push({
        type: 'related',
        entity_type: 'products',
        entity_id: p.id,
        strength: 0.8,
        description: `Same category: ${product.category}`
      });
    });

    // Find products from same brand
    if (product.brand) {
      const sameBrand = allProducts.filter(p =>
        p.id !== product.id && p.brand === product.brand
      );

      sameBrand.forEach(p => {
        relationships.push({
          type: 'related',
          entity_type: 'products',
          entity_id: p.id,
          strength: 0.7,
          description: `Same brand: ${product.brand}`
        });
      });
    }

    return relationships;
  }

  private findInvoiceRelationships(invoice: any, allInvoices: any[]): Relationship[] {
    const relationships: Relationship[] = [];

    // Find invoices for same client
    const sameClient = allInvoices.filter(i =>
      i.id !== invoice.id && i.clientId === invoice.clientId
    );

    sameClient.forEach(i => {
      relationships.push({
        type: 'related',
        entity_type: 'invoices',
        entity_id: i.id,
        strength: 0.9,
        description: `Same client: ${invoice.client?.name}`
      });
    });

    return relationships;
  }

  private findSupplierRelationships(supplier: any, allSuppliers: any[]): Relationship[] {
    const relationships: Relationship[] = [];

    // Find suppliers in same industry
    const sameIndustry = allSuppliers.filter(s =>
      s.id !== supplier.id && s.industry === supplier.industry
    );

    sameIndustry.forEach(s => {
      relationships.push({
        type: 'related',
        entity_type: 'suppliers',
        entity_id: s.id,
        strength: 0.6,
        description: `Same industry: ${supplier.industry}`
      });
    });

    return relationships;
  }

  private findPurchaseRelationships(purchase: any, allPurchases: any[]): Relationship[] {
    const relationships: Relationship[] = [];

    // Find purchases from same supplier
    const sameSupplier = allPurchases.filter(p =>
      p.id !== purchase.id && p.supplierId === purchase.supplierId
    );

    sameSupplier.forEach(p => {
      relationships.push({
        type: 'related',
        entity_type: 'purchases',
        entity_id: p.id,
        strength: 0.8,
        description: `Same supplier: ${purchase.supplier?.name}`
      });
    });

    return relationships;
  }

  private findLedgerRelationships(entry: any, allEntries: any[]): Relationship[] {
    const relationships: Relationship[] = [];

    // Find entries with same reference pattern
    const sameReferencePattern = allEntries.filter(e =>
      e.id !== entry.id && e.reference?.startsWith(entry.reference?.split('-')[0])
    );

    sameReferencePattern.forEach(e => {
      relationships.push({
        type: 'related',
        entity_type: 'ledgers',
        entity_id: e.id,
        strength: 0.7,
        description: `Same reference pattern: ${entry.reference?.split('-')[0]}`
      });
    });

    return relationships;
  }

  private findBalanceRelationships(account: any, allAccounts: any[]): Relationship[] {
    const relationships: Relationship[] = [];

    // Find accounts of same type
    const sameType = allAccounts.filter(a =>
      a.id !== account.id && a.type === account.type
    );

    sameType.forEach(a => {
      relationships.push({
        type: 'related',
        entity_type: 'balances',
        entity_id: a.id,
        strength: 0.6,
        description: `Same account type: ${account.type}`
      });
    });

    return relationships;
  }

  private findSystemFeatureRelationships(feature: any, allFeatures: any[]): Relationship[] {
    const relationships: Relationship[] = [];

    // Find features in same category
    const sameCategory = allFeatures.filter(f =>
      f.id !== feature.id && f.category === feature.category
    );

    sameCategory.forEach(f => {
      relationships.push({
        type: 'related',
        entity_type: 'system_features',
        entity_id: f.id,
        strength: 0.5,
        description: `Same category: ${feature.category}`
      });
    });

    return relationships;
  }

  // ==================== SUMMARY GENERATION METHODS ====================

  private generateUserSummary(user: any): string {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
    const role = user.roles?.join(', ') || 'No role';
    const status = user.status || 'Active';

    return `${name} is a ${status.toLowerCase()} user with role ${role} in the ${user.department || 'General'} department.`;
  }

  private generateClientSummary(client: any): string {
    const status = client.status || 'Active';
    const industry = client.industry || 'General';

    return `${client.name} is a ${status.toLowerCase()} client in the ${industry} industry with credit limit of $${client.creditLimit || 'Not set'}.`;
  }

  private generateProductSummary(product: any): string {
    const stockStatus = product.stockQuantity > 0 ? 'in stock' : 'out of stock';
    const price = product.price || 'Not set';

    return `${product.name} is a ${product.category} product that costs $${price} and is currently ${stockStatus}.`;
  }

  private generateInvoiceSummary(invoice: any): string {
    const status = invoice.paymentStatus || 'Pending';
    const amount = invoice.totalAmount || 0;

    return `Invoice ${invoice.invoiceNumber} for ${invoice.client?.name || 'Unknown'} totaling $${amount} with status ${status}.`;
  }

  private generateSupplierSummary(supplier: any): string {
    const status = supplier.status || 'Active';
    const industry = supplier.industry || 'General';

    return `${supplier.name} is a ${status.toLowerCase()} supplier in the ${industry} industry with contact person ${supplier.contactPerson || 'Not specified'}.`;
  }

  private generatePurchaseSummary(purchase: any): string {
    const status = purchase.status || 'Pending';
    const amount = purchase.totalAmount || 0;

    return `Purchase order ${purchase.orderNumber} from ${purchase.supplier?.name || 'Unknown'} totaling $${amount} with status ${status}.`;
  }

  private generateLedgerSummary(entry: any): string {
    const status = entry.status || 'Posted';
    const amount = entry.totalAmount || 0;

    return `Journal entry ${entry.reference} for ${entry.description || 'General'} totaling $${amount} with status ${status}.`;
  }

  private generateBalanceSummary(account: any): string {
    const status = account.status || 'Active';
    const balance = account.balance || 0;

    return `${account.name} is a ${account.type} account with balance $${balance} and status ${status}.`;
  }

  private generateSystemFeatureSummary(feature: any): string {
    const status = feature.status || 'Active';
    const capabilities = feature.capabilities?.length || 0;

    return `${feature.name} is a ${status.toLowerCase()} system feature with ${capabilities} capabilities for ${feature.description}.`;
  }

  // ==================== UTILITY METHODS ====================

  private calculateProfileCompletion(user: any): number {
    let completed = 0;
    let total = 0;

    const fields = ['firstName', 'lastName', 'email', 'phone', 'department', 'location', 'bio'];
    fields.forEach(field => {
      total++;
      if (user[field]) completed++;
    });

    return Math.round((completed / total) * 100);
  }

  private calculateProfitMargin(product: any): number {
    if (!product.costPrice || !product.price) return 0;
    const margin = ((product.price - product.costPrice) / product.price) * 100;
    return Math.round(margin * 100) / 100;
  }

  private determineUserPriority(user: any): 'low' | 'medium' | 'high' {
    if (user.roles?.includes('admin')) return 'high';
    if (user.roles?.includes('manager')) return 'medium';
    return 'low';
  }

  private determineClientPriority(client: any): 'low' | 'medium' | 'high' {
    if (client.creditLimit && client.creditLimit > 10000) return 'high';
    if (client.creditLimit && client.creditLimit > 5000) return 'medium';
    return 'low';
  }

  private determineProductPriority(product: any): 'low' | 'medium' | 'high' {
    if (product.stockQuantity === 0) return 'high';
    if (product.stockQuantity <= (product.reorderPoint || 0)) return 'medium';
    return 'low';
  }

  private determineInvoicePriority(invoice: any): 'low' | 'medium' | 'high' {
    if (invoice.paymentStatus === 'Overdue') return 'high';
    if (invoice.paymentStatus === 'Pending' && invoice.totalAmount > 1000) return 'medium';
    return 'low';
  }

  private determineSupplierPriority(supplier: any): 'low' | 'medium' | 'high' {
    if (supplier.creditLimit && supplier.creditLimit > 10000) return 'high';
    if (supplier.creditLimit && supplier.creditLimit > 5000) return 'medium';
    return 'low';
  }

  private determinePurchasePriority(purchase: any): 'low' | 'medium' | 'high' {
    if (purchase.status === 'Pending' && purchase.totalAmount > 5000) return 'high';
    if (purchase.status === 'Pending' && purchase.totalAmount > 1000) return 'medium';
    return 'low';
  }

  private determineLedgerPriority(entry: any): 'low' | 'medium' | 'high' {
    if (entry.totalAmount > 10000) return 'high';
    if (entry.totalAmount > 1000) return 'medium';
    return 'low';
  }

  private determineBalancePriority(account: any): 'low' | 'medium' | 'high' {
    if (account.balance > 50000) return 'high';
    if (account.balance > 10000) return 'medium';
    return 'low';
  }

  private determineSystemFeaturePriority(feature: any): 'low' | 'medium' | 'high' {
    if (feature.capabilities?.length > 10) return 'high';
    if (feature.capabilities?.length > 5) return 'medium';
    return 'low';
  }
}
