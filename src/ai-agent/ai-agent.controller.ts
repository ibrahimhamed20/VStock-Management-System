import { Controller, Post, Body, Get, UseGuards, Request, HttpStatus, HttpException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdvancedSearchDto, ChatResponseDto, QueryDto } from './dtos/chat.dto';
import { AiAgentService } from './ai-agent.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/interfaces/auth-payload.interface';

@ApiTags('AI Agent')
@Controller('ai-agent')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
export class AiAgentController {
  constructor(private readonly aiAgentService: AiAgentService) { }

  @Post('chat')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Send a query to the AI agent with enhanced search and context enrichment' })
  @ApiResponse({
    status: 200,
    description: 'AI response with enhanced context, insights, and recommendations',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        html: { type: 'string' },
        data: { type: 'object' },
        timestamp: { type: 'string' },
        conversationId: { type: 'string' },
        searchMetadata: { type: 'object' },
        enhancedContext: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid query' })
  @ApiResponse({ status: 500, description: 'AI agent error' })
  async handleQuery(
    @Body() chatQuery: QueryDto,
    @Request() req: any
  ): Promise<ChatResponseDto> {
    const { query, conversationId } = chatQuery;
    const startTime = Date.now();

    try {
      const userId = req.user?.userId;
      const result = await this.aiAgentService.handleQuery(query, userId, conversationId);
      const duration = Date.now() - startTime;

      return {
        ...result,
        timestamp: new Date().toISOString(),
        searchMetadata: {
          ...result.searchMetadata,
          responseTime: duration,
        }
      };
    } catch (error) {
      throw new HttpException('Failed to process query', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  @Post('search/enhanced')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Perform enhanced search with metadata filtering and context enrichment' })
  @ApiResponse({ status: 200, description: 'Enhanced search results with insights and recommendations' })
  async enhancedSearch(
    @Body() searchDto: AdvancedSearchDto,
    @Request() req: any
  ) {
    const filters = {
      entityTypes: searchDto.entityTypes,
      dateRange: searchDto.dateFrom && searchDto.dateTo ? {
        from: new Date(searchDto.dateFrom),
        to: new Date(searchDto.dateTo)
      } : undefined,
      limit: searchDto.limit
    };

    return this.aiAgentService.enhancedSearch(searchDto.query, filters);
  }



  @Get('health')
  @ApiOperation({ summary: 'Check AI agent health status' })
  @ApiResponse({ status: 200, description: 'AI agent health status' })
  async getHealth() {
    const health = await this.aiAgentService.healthCheck();
    return {
      status: health.status,
      timestamp: new Date().toISOString(),
      message: health.status
        ? 'AI Agent is running and ready to process queries'
        : 'AI Agent is not properly initialized',
      details: health
    };
  }

  /**
   * Switch between Ollama and Hugging Face providers
   */
  @Post('provider/switch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async switchProvider(@Body() body: { provider: 'ollama' | 'huggingface' }) {
    try {
      await this.aiAgentService.switchProvider(body.provider);
      return {
        success: true,
        message: `Switched to ${body.provider} provider`,
        provider: body.provider
      };
    } catch (error) {
      throw new BadRequestException(`Failed to switch provider: ${error.message}`);
    }
  }

  /**
   * Get current LLM provider
   */
  @Get('provider/current')
  @UseGuards(JwtAuthGuard)
  async getCurrentProvider() {
    try {
      const provider = this.aiAgentService.getCurrentProvider();
      return {
        provider,
        message: `Currently using ${provider} provider`
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get provider: ${error.message}`);
    }
  }
}