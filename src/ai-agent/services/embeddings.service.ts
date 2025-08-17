import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OllamaEmbeddings } from '@langchain/ollama';
import { Embeddings } from '@langchain/core/embeddings';

@Injectable()
export class EmbeddingsService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingsService.name);
  private embeddings: OllamaEmbeddings;
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeEmbeddings();
  }

  private async initializeEmbeddings() {
    try {
      this.logger.log('Initializing Ollama embeddings...');
      
      this.embeddings = new OllamaEmbeddings({
        model: this.configService.get('OLLAMA_EMBEDDING_MODEL', 'nomic-embed-text'),
        baseUrl: this.configService.get('OLLAMA_URL', 'http://localhost:11434'),
      });

      // Test the embeddings to ensure they're working
      await this.embeddings.embedQuery('test');
      
      this.isInitialized = true;
      this.logger.log('Ollama embeddings initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Ollama embeddings', error);
      throw error;
    }
  }

  /**
   * Get the embeddings instance
   * @returns The embeddings instance
   */
  getEmbeddingsInstance(): Embeddings {
    if (!this.isInitialized || !this.embeddings) {
      throw new Error('Embeddings not initialized. Please wait for initialization to complete.');
    }
    return this.embeddings;
  }

  /**
   * Get embeddings for multiple texts
   * @param texts Array of text strings to embed
   * @returns Promise with array of embeddings
   */
  async getEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.isInitialized) throw new Error('Embeddings service not initialized');

    try {
      return await this.embeddings.embedDocuments(texts);
    } catch (error) {
      this.logger.error('Error generating embeddings', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  /**
   * Get embedding for a single text
   * @param text Text to embed
   * @returns Promise with the embedding vector
   */
  async getEmbedding(text: string): Promise<number[]> {
    if (!this.isInitialized) throw new Error('Embeddings service not initialized');

    try {
      return await this.embeddings.embedQuery(text);
    } catch (error) {
      this.logger.error('Error generating embedding', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Check if the embeddings service is initialized
   * @returns boolean indicating if the embeddings service is initialized
   */
  isReady(): boolean {
    return this.isInitialized && !!this.embeddings;
  }

  /**
   * Wait for the embeddings service to be ready
   * @param timeoutMs Maximum time to wait in milliseconds (default: 30000ms)
   * @throws Error if embeddings service fails to initialize within timeout
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
          reject(new Error('Embeddings service initialization timed out'));
        }
      }, 100);
    });
  }
} 