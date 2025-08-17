import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ForecastDto } from './dtos/forecast.dto';

@Injectable()
export class ExternalAiService {
  // In a real app, inject HttpService and call external Python/ML API
  async postToAiApi(endpoint: string, payload: any) {
    // Stub: Replace with real HTTP call
    return { endpoint, payload, result: 'stubbed result' };
  }
}

@Injectable()
export class AiService {
  constructor(
    private readonly externalAi: ExternalAiService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async forecastSales(dto: ForecastDto) {
    const cacheKey = `forecastSales:${JSON.stringify(dto)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    const result = await this.externalAi.postToAiApi('/forecast', dto);
    await this.cacheManager.set(cacheKey, result, 120);
    return result;
  }

  async askQuestion(question: string) {
    const cacheKey = `askQuestion:${question}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    const result = await this.externalAi.postToAiApi('/ask', { question });
    await this.cacheManager.set(cacheKey, result, 120);
    return result;
  }

  async getSummary(context: any) {
    const cacheKey = `getSummary:${JSON.stringify(context)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    const result = await this.externalAi.postToAiApi('/summary', context);
    await this.cacheManager.set(cacheKey, result, 120);
    return result;
  }

  async recommendProducts(context: any) {
    const cacheKey = `recommendProducts:${JSON.stringify(context)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    const result = await this.externalAi.postToAiApi('/recommend', context);
    await this.cacheManager.set(cacheKey, result, 120);
    return result;
  }

  async detectAnomalies(context: any) {
    const cacheKey = `detectAnomalies:${JSON.stringify(context)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    const result = await this.externalAi.postToAiApi('/anomaly', context);
    await this.cacheManager.set(cacheKey, result, 120);
    return result;
  }
}
