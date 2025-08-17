import { Controller, Post, Body, Get } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { ForecastDto } from './dtos/forecast.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('AI Internal API')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) { }

  @Post('forecast')
  @ApiOperation({ summary: 'Forecast sales' })
  @ApiResponse({ status: 200, description: 'Forecast result' })
  async forecast(@Body() dto: ForecastDto) {
    return this.aiService.forecastSales(dto);
  }

  @Post('ask')
  @ApiOperation({ summary: 'Ask a question' })
  @ApiResponse({ status: 200, description: 'Answer to the question' })
  async ask(@Body('question') question: string) {
    return this.aiService.askQuestion(question);
  }

  @Post('summary')
  @ApiOperation({ summary: 'Get summary' })
  @ApiResponse({ status: 200, description: 'Summary result' })
  async summary(@Body() context: any) {
    return this.aiService.getSummary(context);
  }

  @Post('recommend')
  @ApiOperation({ summary: 'Recommend products' })
  @ApiResponse({ status: 200, description: 'Recommendation result' })
  async recommend(@Body() context: any) {
    return this.aiService.recommendProducts(context);
  }

  @Post('anomaly')
  @ApiOperation({ summary: 'Detect anomalies' })
  @ApiResponse({ status: 200, description: 'Anomaly detection result' })
  async anomaly(@Body() context: any) {
    return this.aiService.detectAnomalies(context);
  }

  // This endpoint allows 5 requests per 30 seconds per user/key/IP
  @Throttle({ 'AI_CHAT_THROTTLE': { limit: 5, ttl: 30 } })
  @Post('query')
  @ApiOperation({ summary: 'Handle query' })
  @ApiResponse({ status: 200, description: 'Query processed' })
  handleQuery() {
    return { message: 'AI query processed' };
  }

  // This endpoint is NOT rate limited
  @SkipThrottle()
  @Get('status')
  @ApiOperation({ summary: 'Check AI agent health status' })
  @ApiResponse({ status: 200, description: 'AI agent health status' })
  healthCheck() {
    return { status: 'ok' };
  }
}
