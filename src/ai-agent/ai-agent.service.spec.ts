import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AiAgentService } from './ai-agent.service';
import { UsersService } from '../users/services/users.service';
import { SyncService } from './services/sync.service';
import { ClientsService } from '../clients/clients.service';
import { InventoryService } from '../inventory/inventory.service';
import { AccountingService } from '../accounting/accounting.service';
import { ConversationService } from './services/conversation.service';

// Mock LangChain.js components
jest.mock('@langchain/pgvector', () => ({
  PGVectorStore: {
    initialize: jest.fn().mockResolvedValue({
      addDocuments: jest.fn().mockResolvedValue(undefined),
      similaritySearch: jest.fn().mockResolvedValue([]),
      end: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

jest.mock('@langchain/ollama', () => ({
  Ollama: jest.fn().mockImplementation(() => ({
    invoke: jest.fn().mockResolvedValue({ text: 'Mock response' }),
  })),
}));

jest.mock('@langchain/core/chains', () => ({
  RetrievalQAChain: {
    fromLLM: jest.fn().mockReturnValue({
      invoke: jest.fn().mockResolvedValue({
        text: 'Mock AI response',
        sourceDocuments: [
          {
            pageContent: 'Mock document content',
            metadata: { entity_type: 'user', entity_id: '1' },
          },
        ],
      }),
    }),
  },
}));

jest.mock('@langchain/text-splitter', () => ({
  RecursiveCharacterTextSplitter: jest.fn().mockImplementation(() => ({
    splitText: jest.fn().mockResolvedValue(['Mock chunk 1', 'Mock chunk 2']),
  })),
}));

jest.mock('@langchain/community/embeddings/hf_transformers', () => ({
  HuggingFaceTransformersEmbeddings: jest.fn().mockImplementation(() => ({
    embedDocuments: jest.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
  })),
}));

describe('AiAgentService', () => {
  let service: AiAgentService;
  let configService: ConfigService;
  let usersService: UsersService;
  let clientsService: jest.Mocked<ClientsService>;
  let inventoryService: jest.Mocked<InventoryService>;
  let accountingService: jest.Mocked<AccountingService>;
  let syncService: jest.Mocked<SyncService>;
  let conversationService: jest.Mocked<ConversationService>;
  let httpService: HttpService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config = {
        DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
        OLLAMA_URL: 'http://localhost:11434',
        PG_USER: 'test',
        PG_PASSWORD: 'test',
        PG_HOST: 'localhost',
        PG_PORT: '5432',
        PG_DATABASE: 'test',
      };
      return config[key] || defaultValue;
    }),
  };

  const mockUsersService = {
    findAllUsers: jest.fn().mockResolvedValue({
      data: [
        {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['admin'],
          status: 'active',
          lastLogin: new Date(),
        },
      ],
      total: 1,
    }),
  };

  const mockClientsService = {
    findAll: jest.fn().mockResolvedValue([
      {
        id: '1',
        name: 'Test Client',
        email: 'client@example.com',
        phone: '1234567890',
        tags: ['vip'],
      },
    ]),
  };

  const mockInventoryService = {
    findAllProducts: jest.fn().mockResolvedValue([
      {
        id: '1',
        name: 'Test Product',
        sku: 'TEST001',
        stock: 10,
        unitCost: 5.0,
        sellingPrice: 10.0,
        category: 'Electronics',
      },
    ]),
  };

  const mockAccountingService = {
    getAccounts: jest.fn().mockResolvedValue([
      {
        id: '1',
        name: 'Cash Account',
        code: '1000',
        type: 'asset',
        balance: 1000.0,
      },
    ]),
  };

  const mockSyncService = {
    addDocumentsToVectorStore: jest.fn().mockResolvedValue(1),
    syncWithRetry: jest.fn().mockResolvedValue({}),
    syncAllData: jest.fn().mockResolvedValue({}),
    setVectorStore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAgentService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
        {
          provide: AccountingService,
          useValue: mockAccountingService,
        },
        {
          provide: SyncService,
          useValue: mockSyncService,
        },
        {
          provide: ConversationService,
          useValue: {
            createConversation: jest.fn(),
            getConversation: jest.fn(),
            addMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiAgentService>(AiAgentService);
    configService = module.get<ConfigService>(ConfigService);
    usersService = module.get<UsersService>(UsersService);
    clientsService = module.get(ClientsService) as jest.Mocked<ClientsService>;
    inventoryService = module.get(InventoryService) as jest.Mocked<InventoryService>;
    accountingService = module.get(AccountingService) as jest.Mocked<AccountingService>;
    syncService = module.get(SyncService) as jest.Mocked<SyncService>;
    conversationService = module.get(ConversationService) as jest.Mocked<ConversationService>;
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize vector store, LLM, and sync data', async () => {
      // Mock the private methods
      const initializeVectorStoreSpy = jest.spyOn(service as any, 'initializeVectorStore');
      const initializeLLMSpy = jest.spyOn(service as any, 'initializeLLM');
      const syncAllDataSpy = jest.spyOn(service as any, 'syncAllData');

      await service.onModuleInit();

      expect(initializeVectorStoreSpy).toHaveBeenCalled();
      expect(initializeLLMSpy).toHaveBeenCalled();
      expect(syncAllDataSpy).toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock initializeVectorStore to throw an error
      jest.spyOn(service as any, 'initializeVectorStore').mockRejectedValue(new Error('Init failed'));

      await expect(service.onModuleInit()).rejects.toThrow('Init failed');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should clean up vector store', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await service.onModuleDestroy();

      expect(consoleLogSpy).toHaveBeenCalledWith('AI Agent cleaned up successfully');
    });
  });

  describe('handleQuery', () => {
    beforeEach(async () => {
      // Initialize the service first
      await service.onModuleInit();
      
      // Reset all mocks before each test
      jest.clearAllMocks();
    });

    it('should create a new conversation if no conversationId is provided', async () => {
      const query = 'Test query';
      const userId = 'test-user-id';
      
      const result = await service.handleQuery(query, userId, undefined, []);
      
      expect(conversationService.createConversation).toHaveBeenCalledWith(userId, undefined);
      expect(result.conversationId).toBeDefined();
    });

    it('should use existing conversation if conversationId is provided', async () => {
      const query = 'Test query';
      const userId = 'test-user-id';
      const conversationId = 'existing-conversation-id';
      
      // Mock the conversation service to return a conversation
      (conversationService.getConversation as jest.Mock).mockResolvedValueOnce({
        id: conversationId,
        userId,
        title: 'Test Conversation'
      });
      
      const result = await service.handleQuery(query, userId, conversationId, []);
      
      expect(conversationService.getConversation).toHaveBeenCalledWith(conversationId, userId);
      expect(conversationService.createConversation).not.toHaveBeenCalled();
      expect(result.conversationId).toBe(conversationId);
    });

    it('should save user and assistant messages to the conversation', async () => {
      const query = 'Test query';
      const userId = 'test-user-id';
      const conversationId = 'test-conversation-id';
      
      // Mock the conversation service to return a conversation
      (conversationService.getConversation as jest.Mock).mockResolvedValueOnce({
        id: conversationId,
        userId,
        title: 'Test Conversation'
      });
      
      await service.handleQuery(query, userId, conversationId, []);
      
      expect(conversationService.addMessage).toHaveBeenCalledTimes(2);
      expect(conversationService.addMessage).toHaveBeenNthCalledWith(
        1,
        conversationId,
        query,
        'user',
        expect.any(Object)
      );
      expect(conversationService.addMessage).toHaveBeenNthCalledWith(
        2,
        conversationId,
        expect.any(String),
        'assistant',
        expect.any(Object)
      );
    });

    it('should return a properly formatted response', async () => {
      const query = 'Test query';
      const userId = 'test-user-id';
      
      const result = await service.handleQuery(query, userId);
      
      expect(result).toEqual({
        message: expect.any(String),
        html: expect.stringContaining('<p>'),
        conversationId: expect.any(String),
        searchMetadata: expect.any(Object)
      });
    });

    it('should process a query and return response', async () => {
      const query = 'List users with admin role';
      const result = await service.handleQuery(query);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('html');
      expect(result.message).toBe('Mock AI response');
      expect(result.html).toContain('Mock document content');
    });

    it('should throw error if not initialized', async () => {
      // Create a new service instance without initialization
      const newService = new AiAgentService(
        {} as HttpService,
        configService,
        usersService,
        clientsService,
        inventoryService,
        accountingService,
        syncService as unknown as SyncService
      );

      await expect(newService.handleQuery('test query')).rejects.toThrow(
        'AI Agent is not initialized',
      );
    });

    it('should handle query processing errors', async () => {
      // Mock the chain to throw an error
      const mockChain = {
        invoke: jest.fn().mockRejectedValue(new Error('LLM error')),
      };
      (service as any).chain = mockChain;

      await expect(service.handleQuery('test query')).rejects.toThrow(
        'Failed to process query. Please try again.',
      );
    });
  });

  // testVectorSearch tests removed as the method doesn't exist in the service

  describe('syncAllData', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should sync all entity data', async () => {
      const syncUsersSpy = jest.spyOn(service as any, 'syncUsers');
      const syncClientsSpy = jest.spyOn(service as any, 'syncClients');
      const syncInventorySpy = jest.spyOn(service as any, 'syncInventory');
      const syncAccountingSpy = jest.spyOn(service as any, 'syncAccounting');

      await (service as any).syncAllData();

      expect(syncUsersSpy).toHaveBeenCalled();
      expect(syncClientsSpy).toHaveBeenCalled();
      expect(syncInventorySpy).toHaveBeenCalled();
      expect(syncAccountingSpy).toHaveBeenCalled();
    });

    it('should handle sync errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock syncUsers to throw an error
      jest.spyOn(service as any, 'syncUsers').mockRejectedValue(new Error('Sync failed'));

      await (service as any).syncAllData();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error during periodic data sync', expect.any(Error));
    });
  });

  describe('generateHTMLFromDocuments', () => {
    it('should generate HTML table from documents', () => {
      const documents = [
        {
          pageContent: 'User: John Doe (john@example.com)',
          metadata: { entity_type: 'user', entity_id: '1' },
        },
        {
          pageContent: 'Product: Test Product (SKU: TEST001)',
          metadata: { entity_type: 'product', entity_id: '1' },
        },
      ];

      const html = (service as any).generateHTMLFromDocuments(documents, 'test query');

      expect(html).toContain('<table');
      expect(html).toContain('users');
      expect(html).toContain('products');
      expect(html).toContain('John Doe');
      expect(html).toContain('Test Product');
    });

    it('should handle HTML generation errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock reduce to throw an error
      const documents = [{}];
      jest.spyOn(documents, 'reduce').mockImplementation(() => {
        throw new Error('Reduce error');
      });

      const html = (service as any).generateHTMLFromDocuments(documents, 'test query');

      expect(html).toBe('<p class="text-red-500">Error generating results table</p>');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('SyncService Integration', () => {

    describe('addDocumentsToVectorStore', () => {
      it('should add documents to vector store', async () => {
        const documents = [
          {
            id: 'test_1',
            content: 'Test document content',
            metadata: {
              entity_type: 'test',
              entity_id: '1',
              timestamp: new Date().toISOString(),
            },
          },
        ];

        await syncService.addDocumentsToVectorStore(documents, 'test');

        // Verify that the vector store addDocuments was called
        expect((service as any).vectorStore.addDocuments).toHaveBeenCalled();
      });

      it('should handle empty documents array', async () => {
        await syncService.addDocumentsToVectorStore([], 'test');
        
        // Should not call addDocuments on empty array
        expect((service as any).vectorStore.addDocuments).not.toHaveBeenCalled();
      });

      it('should handle document addition errors', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        // Mock addDocuments to throw an error
        (service as any).vectorStore.addDocuments.mockRejectedValue(new Error('Add failed'));

        const documents = [
          {
            id: 'test_1',
            content: 'Test document content',
            metadata: {
              entity_type: 'test',
              entity_id: '1',
              timestamp: new Date().toISOString(),
            },
          },
        ];

        await syncService.addDocumentsToVectorStore(documents, 'test');

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error adding batch to vector store',
          expect.any(Error),
        );
      });
    });
  });
});