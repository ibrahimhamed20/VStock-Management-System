import { StringOutputParser } from '@langchain/core/output_parsers';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EnhancedSearchService } from './enhanced-search.service';
import { AssistantPrompt, getAssistantPrompt } from '../prompts/assistant.prompt';
import { RunnableSequence } from '@langchain/core/runnables';
import { VectorStoreService } from './vector-store.service';
import { PromptTemplate } from '@langchain/core/prompts';
import { EmbeddingsService } from './embeddings.service';
import { ConfigService } from '@nestjs/config';
import { Ollama } from '@langchain/ollama';
import { HfInference, InferenceClient } from '@huggingface/inference';

//#region Interfaces
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  context: string;
  lastActivity: Date;
}

interface ChatOptions {
  useEnhancedSearch?: boolean;
  filters?: {
    entityTypes?: string[];
    dateRange?: { from: Date; to: Date };
    metadata?: Record<string, any>;
  };
  streamResponse?: boolean;
  provider?: 'ollama' | 'huggingface'; // Allow provider selection
}

interface SearchFilters {
  entityTypes?: string[];
  dateRange?: { from: Date; to: Date };
  metadata?: Record<string, any>;
  limit?: number;
}

interface ChatResult {
  response: string;
  sessionId: string;
  metadata: {
    responseTime: number;
    searchMetadata: any;
    messageCount: number;
    sessionAge: number;
    strategyUsed: string;
    provider: string;
  };
}
//#endregion

//#region Constants
const TIMEOUT_MS = 45000; // 45 seconds max for HF
const FALLBACK_TIMEOUT_MS = 25000; // 25 seconds for fallback
const MAX_SEARCH_RESULTS = 8; // Increased for HF
const MAX_CONTEXT_LENGTH = 2000; // Increased context for HF
const MAX_SESSION_AGE = 60 * 60 * 1000; // 1 hour
const MAX_MESSAGES_PER_SESSION = 30; // Increased message history for HF
const SESSION_CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes
//#endregion

@Injectable()
export class LlmService implements OnModuleInit {
  private readonly logger = new Logger(LlmService.name);

  //#region Private Properties
  private ollama: Ollama;
  private huggingFace: HfInference;
  private huggingFaceModel: string;
  private runnableSequence: RunnableSequence;
  private isInitialized = false;
  private chatSessions = new Map<string, ChatSession>();
  private currentProvider: 'ollama' | 'huggingface' = 'ollama';
  //#endregion

  //#region Constructor
  constructor(
    private readonly configService: ConfigService,
    private readonly vectorStoreService: VectorStoreService,
    private readonly enhancedSearchService: EnhancedSearchService
  ) { }
  //#endregion

  //#region Lifecycle Methods
  async onModuleInit() {
    await this.initializeLLM();
    this.isInitialized = true;
    this.logger.log(`LLM Service initialized with ${this.currentProvider} provider`);

    // Clean up old sessions periodically
    setInterval(() => this.cleanupOldSessions(), SESSION_CLEANUP_INTERVAL);
  }
  //#endregion

  //#region Public Chat Methods
  /**
   * Simple, reliable chat method with progressive fallback
   */
  async chat(
    message: string,
    sessionId: string,
    userId: string,
    options: ChatOptions = {}
  ): Promise<ChatResult> {
    if (!this.isInitialized) throw new Error('LLM service not initialized');

    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 9);
    const provider = options.provider || this.currentProvider;

    try {
      this.logger.debug(`[${requestId}] Starting chat for session ${sessionId} with ${provider}`);

      // Get or create chat session
      let session = this.getOrCreateSession(sessionId, userId);

      // Add user message to session
      session.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
        metadata: { requestId, provider }
      });

      // Try progressive strategies until one works
      const { response, strategyUsed } = await this.tryStrategies(message, session, options, requestId, provider);

      // Update session with response
      this.updateSessionWithResponse(session, response, requestId, { strategyUsed, provider });

      const responseTime = Date.now() - startTime;
      this.logger.debug(`[${requestId}] Chat completed in ${responseTime}ms using ${strategyUsed} with ${provider}`);

      return {
        response,
        sessionId,
        metadata: {
          responseTime,
          searchMetadata: { strategyUsed, provider },
          messageCount: session.messages.length,
          sessionAge: Date.now() - session.lastActivity.getTime(),
          strategyUsed,
          provider
        }
      };

    } catch (error) {
      this.logger.error(`[${requestId}] Chat failed with ${provider}`, error);
      throw this.handleChatError(error);
    }
  }

  /**
   * Simple response generation without complex context
   */
  async generateResponse(question: string, context: string = '', history: string = '', provider?: 'ollama' | 'huggingface'): Promise<string> {
    if (!this.isInitialized) throw new Error('LLM service not initialized');

    try {
      const languageContext = this.getLanguageContext(question);
      const enhancedQuestion = `${languageContext}\n\nQuestion: ${question}`;

      this.logger.debug(`Generating response for: ${question.substring(0, 50)}... with ${provider || this.currentProvider}`);

      // Send complete context and history without truncation
      const response = await this.generateResponseWithTimeout(
        enhancedQuestion,
        context, // Complete context
        history, // Complete history
        TIMEOUT_MS,
        provider || this.currentProvider
      );

      this.logger.debug('Response generated successfully');
      return response;
    } catch (error) {
      this.logger.error('Error generating response from LLM', error);
      throw this.handleChatError(error);
    }
  }

  /**
   * Switch between Ollama and Hugging Face providers
   */
  async switchProvider(provider: 'ollama' | 'huggingface'): Promise<void> {
    this.currentProvider = provider;
    this.logger.log(`Switched to ${provider} provider`);
  }

  /**
   * Get current provider
   */
  getCurrentProvider(): string {
    return this.currentProvider;
  }
  //#endregion

  //#region Public Search Methods
  /**
   * Simple search with limited results
   */
  async enhancedSearch(query: string, filters?: SearchFilters) {
    if (!this.isInitialized) throw new Error('LLM service not initialized');

    try {
      const searchResults = await this.enhancedSearchService.enhancedSearch(query, {
        ...filters,
        limit: MAX_SEARCH_RESULTS
      });

      return {
        searchResults: searchResults.slice(0, MAX_SEARCH_RESULTS),
        totalResults: searchResults.length
      };
    } catch (error) {
      this.logger.error('Error in enhanced search', error);
      throw new Error('Enhanced search failed');
    }
  }
  //#endregion

  //#region Public Session Management Methods
  getSessionInfo(sessionId: string): ChatSession | null {
    return this.chatSessions.get(sessionId) || null;
  }

  clearSession(sessionId: string): boolean {
    return this.chatSessions.delete(sessionId);
  }

  getActiveSessions(): Array<{ sessionId: string; messageCount: number; lastActivity: Date }> {
    return Array.from(this.chatSessions.entries()).map(([sessionId, session]) => ({
      sessionId,
      messageCount: session.messages.length,
      lastActivity: session.lastActivity
    }));
  }
  //#endregion

  //#region Public Utility Methods
  async preprocessQuery(query: string): Promise<string> {
    const expansions = {
      'inv': 'inventory',
      'acc': 'accounting',
      'cust': 'customer client',
      'supp': 'supplier',
      'prod': 'product',
      'bal': 'balance',
      'rev': 'revenue sales',
    };

    let processedQuery = query.toLowerCase();

    Object.entries(expansions).forEach(([abbrev, expansion]) => {
      const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
      processedQuery = processedQuery.replace(regex, expansion);
    });

    return processedQuery;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
  //#endregion

  //#region Private Initialization Methods
  private async initializeLLM() {
    try {
      const ollamaUrl = this.configService.get('OLLAMA_URL');
      const ollamaModel = this.configService.get('OLLAMA_CHAT_MODEL');
      const huggingFaceModel = this.configService.get('HUGGING_FACE_MODEL');
      const huggingFaceApiKey = this.configService.get('HUGGING_FACE_API_KEY');
      const defaultProvider = this.configService.get('LLM_PROVIDER') as 'ollama' | 'huggingface';

      this.currentProvider = defaultProvider;

      this.logger.log(`Initializing LLM with ${this.currentProvider} provider`);

      // Initialize Ollama
      if (this.currentProvider === 'ollama' || !huggingFaceApiKey) {
        this.logger.log(`Initializing Ollama connection to ${ollamaUrl} with model ${ollamaModel}`);
        await this.testOllamaConnection(ollamaUrl);
        const modelConfig = this.getModelConfig(ollamaModel);

        this.ollama = new Ollama({
          baseUrl: ollamaUrl,
          model: ollamaModel,
          ...modelConfig,
          callbacks: [
            {
              handleLLMStart: () => this.logger.debug('LLM generation started'),
              handleLLMEnd: () => this.logger.debug('LLM generation completed'),
              handleLLMError: (error) => this.logger.error('LLM generation error:', error),
            },
          ],
        });
      }

      // Initialize Hugging Face
      if (this.currentProvider === 'huggingface' && huggingFaceApiKey) {
        this.logger.log(`Initializing Hugging Face connection with model ${huggingFaceModel}`);

        this.huggingFace = new InferenceClient(huggingFaceApiKey);
        this.huggingFaceModel = huggingFaceModel;

        // Test Hugging Face connection
        await this.testHuggingFaceConnection();
      }

      // Initialize runnable sequence with current provider
      const prompt = PromptTemplate.fromTemplate(AssistantPrompt);

      this.runnableSequence = RunnableSequence.from([
        {
          context: async (input: { question: string; context?: string; history?: string }) => {
            if (!this.vectorStoreService.isReady()) throw new Error('Vector store not initialized');
            const docs = await this.vectorStoreService.similaritySearch(input.question, MAX_SEARCH_RESULTS);
            return docs.map((d) => d.pageContent).join('\n'); // Complete context without truncation
          },
          question: (input: { question: string; history?: string }) => input.question,
          history: (input: { question: string; history?: string }) => input.history || '',
        },
        prompt,
        this.currentProvider === 'ollama' ? this.ollama : this.createHuggingFaceWrapper(),
        new StringOutputParser(),
      ]);

    } catch (error) {
      this.logger.error('Failed to initialize LLM service', error);
      throw error;
    }
  }

  private async testOllamaConnection(baseUrl: string): Promise<void> {
    try {
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Ollama API returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.log(`Ollama connection successful. Available models: ${data.models?.map((m: any) => m.name).join(', ') || 'None'}`);
    } catch (error) {
      this.logger.error(`Failed to connect to Ollama at ${baseUrl}`, error);
      throw new Error(`Cannot connect to Ollama service at ${baseUrl}. Please ensure Ollama is running and accessible.`);
    }
  }

  private async testHuggingFaceConnection(): Promise<void> {
    try {
      // Test with a simple prompt using text generation
      const testResponse = await this.huggingFace.chatCompletion({
        model: this.huggingFaceModel,
        messages: [
          {
            role: 'user',
            content: 'Hello',
          },
        ],
      });
      console.log(testResponse);
      this.logger.log('Hugging Face connection successful');
    } catch (error) {
      this.logger.error('Failed to connect to Hugging Face', error);
      throw new Error('Cannot connect to Hugging Face. Please check your API key and model configuration.');
    }
  }
  //#endregion

  //#region Private Session Management Methods
  private getOrCreateSession(sessionId: string, userId: string): ChatSession {
    let session = this.chatSessions.get(sessionId);

    if (!session) {
      session = {
        sessionId,
        messages: [],
        context: '',
        lastActivity: new Date()
      };
      this.chatSessions.set(sessionId, session);
      this.logger.debug(`Created new chat session: ${sessionId}`);
    } else {
      session.lastActivity = new Date();
    }

    return session;
  }

  private updateSessionWithResponse(session: ChatSession, response: string, requestId: string, metadata: any) {
    session.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      metadata: { requestId, ...metadata }
    });

    session.lastActivity = new Date();
    this.chatSessions.set(session.sessionId, session);
    this.cleanupSessionMessages(session.sessionId);
  }

  private buildConversationHistory(messages: ChatMessage[], limit: number = -1): string {
    const recentMessages = limit > 0 ? messages.slice(-limit) : messages; // -1 means all messages

    return recentMessages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
  }

  private cleanupSessionMessages(sessionId: string): void {
    const session = this.chatSessions.get(sessionId);
    if (!session) return;

    if (session.messages.length > MAX_MESSAGES_PER_SESSION) {
      const systemMessages = session.messages.filter(m => m.role === 'system');
      const recentMessages = session.messages
        .filter(m => m.role !== 'system')
        .slice(-MAX_MESSAGES_PER_SESSION + systemMessages.length);

      session.messages = [...systemMessages, ...recentMessages];
    }
  }

  private cleanupOldSessions(): void {
    const now = Date.now();
    const sessionsToDelete: string[] = [];

    for (const [sessionId, session] of this.chatSessions.entries()) {
      if (now - session.lastActivity.getTime() > MAX_SESSION_AGE) {
        sessionsToDelete.push(sessionId);
      }
    }

    sessionsToDelete.forEach(sessionId => {
      this.chatSessions.delete(sessionId);
      this.logger.debug(`Cleaned up old session: ${sessionId}`);
    });

    if (sessionsToDelete.length > 0) {
      this.logger.log(`Cleaned up ${sessionsToDelete.length} old chat sessions`);
    }
  }
  //#endregion

  //#region Private Strategy Methods
  /**
   * Try multiple strategies in order of complexity (HF-optimized)
   */
  private async tryStrategies(
    message: string,
    session: ChatSession,
    options: ChatOptions,
    requestId: string,
    provider: 'ollama' | 'huggingface'
  ): Promise<{ response: string; strategyUsed: string }> {

    const strategies = [
      // Strategy 1: Enhanced search with complete context
      {
        name: 'enhanced_search',
        execute: async () => {
          this.logger.debug(`[${requestId}] Trying enhanced search strategy with ${provider}`);
          const processedMessage = await this.preprocessQuery(message);
          const languageContext = this.getLanguageContext(processedMessage);
          const enhancedMessage = `${languageContext}\n\nQuestion: ${processedMessage}`;

          const docs = await this.vectorStoreService.similaritySearch(processedMessage, MAX_SEARCH_RESULTS);
          const context = docs.map((d) => d.pageContent).join('\n'); // Complete context without truncation
          const history = this.buildConversationHistory(session.messages, -1); // Complete history

          return await this.generateResponseWithTimeout(enhancedMessage, context, history, TIMEOUT_MS, provider);
        }
      },

      // Strategy 2: Moderate context with complete history
      {
        name: 'moderate_context',
        execute: async () => {
          this.logger.debug(`[${requestId}] Trying moderate context strategy with ${provider}`);
          const processedMessage = await this.preprocessQuery(message);
          const languageContext = this.getLanguageContext(processedMessage);
          const enhancedMessage = `${languageContext}\n\nQuestion: ${processedMessage}`;

          const docs = await this.vectorStoreService.similaritySearch(processedMessage, 4);
          const context = docs.map((d) => d.pageContent).join('\n'); // Complete context
          const history = this.buildConversationHistory(session.messages, -1); // Complete history
          return await this.generateResponseWithTimeout(enhancedMessage, context, history, FALLBACK_TIMEOUT_MS, provider);
        }
      },

      // Strategy 3: No context with complete history
      {
        name: 'history_only',
        execute: async () => {
          this.logger.debug(`[${requestId}] Trying history-only strategy with ${provider}`);
          const processedMessage = await this.preprocessQuery(message);
          const languageContext = this.getLanguageContext(processedMessage);
          const enhancedMessage = `${languageContext}\n\nQuestion: ${processedMessage}`;

          const history = this.buildConversationHistory(session.messages, -1); // Complete history
          return await this.generateResponseWithTimeout(enhancedMessage, '', history, FALLBACK_TIMEOUT_MS, provider);
        }
      }
    ];

    // Try each strategy until one works
    for (const strategy of strategies) {
      try {
        const response = await strategy.execute();
        this.logger.debug(`[${requestId}] Strategy ${strategy.name} succeeded with ${provider}`);
        return { response, strategyUsed: strategy.name };
      } catch (error) {
        this.logger.warn(`[${requestId}] Strategy ${strategy.name} failed with ${provider}: ${error.message}`);
        continue;
      }
    }

    throw new Error('All strategies failed');
  }
  //#endregion

  //#region Private Response Generation Methods
  private async generateResponseWithTimeout(question: string, context: string, history: string, timeoutMs: number, provider: 'ollama' | 'huggingface'): Promise<string> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });

    // Build the full prompt
    const fullPrompt = getAssistantPrompt(history, context, question);

    let responsePromise: Promise<string>;
    if (provider === 'ollama') {
      responsePromise = this.ollama.invoke(fullPrompt);
    } else { // huggingface
      responsePromise = this.huggingFace.chatCompletion({
        model: this.huggingFaceModel,
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        max_tokens: 1024, // Increased for better responses
        temperature: 0.1,
        top_p: 0.9,
      }).then(response => response.choices[0].message.content || '');
    }

    return await Promise.race([responsePromise, timeoutPromise]);
  }
  //#endregion

  //#region Private Utility Methods
  private isArabicQuery(query: string): boolean {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(query);
  }

  private getLanguageContext(question: string): string {
    const isArabic = this.isArabicQuery(question);
    return isArabic
      ? 'IMPORTANT: The user asked in Arabic. Respond in Arabic only.'
      : 'IMPORTANT: The user asked in English. Respond in English only.';
  }

  private handleChatError(error: any): Error {
    if (error.message?.includes('fetch failed')) {
      return new Error('Cannot connect to Ollama service. Please ensure Ollama is running.');
    }

    if (error.message?.includes('timeout')) {
      return new Error('Request timed out. The model might be busy or the request is too complex.');
    }

    if (error.message?.includes('Vector store not initialized')) {
      return new Error('Search service is not ready. Please try again in a moment.');
    }

    return new Error(`Chat failed: ${error.message}`);
  }
  //#endregion

  //#region Private Configuration Methods
  private getModelConfig(modelName: string) {
    // CPU-optimized base configuration
    const baseConfig = {
      temperature: 0.1,
      topP: 0.9,
      topK: 40,
      repeatPenalty: 1.1,
      numCtx: 256, // Very small context for CPU speed
      numPredict: 128, // Small prediction for CPU speed
      numThread: 4, // Use 4 CPU threads
      numGpu: 0, // No GPU
      numGqa: 1, // Group query attention for CPU
      ropeScaling: { type: 'linear', factor: 1.0 }, // CPU-optimized scaling
    };

    switch (modelName.toLowerCase()) {
      case 'llama3.1:8b':
        return {
          ...baseConfig,
          numCtx: 512, // Reduced for CPU
          numPredict: 256, // Reduced for CPU
          numThread: 6, // More threads for larger model
        };

      case 'llama3.1:70b':
        return {
          ...baseConfig,
          numCtx: 1024, // Much reduced for CPU
          numPredict: 512, // Reduced for CPU
          numThread: 8, // More threads for large model
        };

      case 'gemma:2b':
        return {
          ...baseConfig,
          temperature: 0.2,
          topP: 0.8,
          topK: 30,
          repeatPenalty: 1.05,
          numCtx: 512, // Good for CPU
          numPredict: 256, // Good for CPU
          numThread: 4, // Optimal for small model
        };

      case 'mistral:7b':
        return {
          ...baseConfig,
          numCtx: 512, // Reduced for CPU
          numPredict: 256, // Reduced for CPU
          numThread: 6, // More threads for medium model
        };

      case 'phi3:mini':
        return {
          ...baseConfig,
          temperature: 0.1,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          numCtx: 512, // Perfect for CPU
          numPredict: 256, // Perfect for CPU
          numThread: 4, // Optimal for small model
        };

      case 'qwen2.5:0.5b':
        return {
          ...baseConfig,
          temperature: 0.1,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          numCtx: 256, // Very small for ultra-fast CPU
          numPredict: 128, // Very small for ultra-fast CPU
          numThread: 2, // Minimal threads for tiny model
        };

      default:
        this.logger.warn(`No specific config for model ${modelName}, using CPU-optimized default settings`);
        return baseConfig;
    }
  }
  //#endregion

  //#region Private Hugging Face Wrapper
  private createHuggingFaceWrapper() {
    return {
      invoke: async (prompt: string) => {
        try {
          const response = await this.huggingFace.chatCompletion({
            model: this.huggingFaceModel,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 1024, // Increased for better responses
            temperature: 0.1,
            top_p: 0.9,
          });
          return response.generated_text;
        } catch (error) {
          this.logger.error('Error invoking Hugging Face model', error);
          throw new Error(`Hugging Face model invocation failed: ${error.message}`);
        }
      },
    };
  }
  //#endregion
}
