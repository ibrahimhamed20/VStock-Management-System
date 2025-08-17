import { Controller, UseGuards, Get, Param, Patch, Body, Delete, Request, Query } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation, ApiQuery, ApiParam } from "@nestjs/swagger";
import { UserRole } from "../../auth/interfaces/auth-payload.interface";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { IsString, IsNotEmpty } from "class-validator";
import { ConversationService } from "../services";

export class UpdateConversationTitleDto {
    @IsString()
    @IsNotEmpty()
    title: string;
}

@ApiTags('AI Agent')
@Controller('ai-agent')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
export class ConversationsController {
    constructor(private readonly conversationService: ConversationService) { }

    @Get('conversations')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.CASHIER)
    @ApiOperation({ summary: 'List user conversations' })
    @ApiResponse({ status: 200, description: 'List of conversations' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'offset', required: false, type: Number })
    async listConversations(
        @Request() req: any,
        @Query('limit') limit = 20,
        @Query('offset') offset = 0
    ) {
        return this.conversationService.listConversations(req.user?.userId, limit, offset);
    }

    @Get('conversations/:conversationId/messages')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.CASHIER)
    @ApiOperation({ summary: 'Get conversation messages' })
    @ApiResponse({ status: 200, description: 'List of messages in the conversation' })
    @ApiParam({ name: 'conversationId', description: 'ID of the conversation' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'offset', required: false, type: Number })
    async getConversationMessages(
        @Param('conversationId') conversationId: string,
        @Request() req: any,
        @Query('limit') limit = 50,
        @Query('offset') offset = 0
    ) {
        return this.conversationService.getConversationMessages(
            conversationId,
            req.user?.userId,
            limit,
            offset
        );
    }

    @Patch('conversations/:conversationId/title')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.CASHIER)
    @ApiOperation({ summary: 'Update conversation title' })
    @ApiResponse({ status: 200, description: 'Updated conversation' })
    @ApiParam({ name: 'conversationId', description: 'ID of the conversation' })
    async updateConversationTitle(
        @Param('conversationId') conversationId: string,
        @Body() updateDto: UpdateConversationTitleDto,
        @Request() req: any
    ) {
        return this.conversationService.updateConversationTitle(
            conversationId,
            req.user?.userId,
            updateDto.title
        );
    }

    @Delete('conversations/:conversationId')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.CASHIER)
    @ApiOperation({ summary: 'Delete a conversation' })
    @ApiResponse({ status: 200, description: 'Confirmation of deletion' })
    @ApiParam({ name: 'conversationId', description: 'ID of the conversation to delete' })
    async deleteConversation(
        @Param('conversationId') conversationId: string,
        @Request() req: any
    ) {
        return this.conversationService.deleteConversation(conversationId, req.user?.userId);
    }

    @Get('conversations/:conversationId/search')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.CASHIER)
    @ApiOperation({ summary: 'Search within conversation messages' })
    @ApiResponse({ status: 200, description: 'Search results' })
    @ApiParam({ name: 'conversationId', description: 'ID of the conversation' })
    @ApiQuery({ name: 'q', description: 'Search query' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async searchConversationMessages(
        @Param('conversationId') conversationId: string,
        @Request() req: any,
        @Query('q') query: string,
        @Query('limit') limit = 20
    ) {
        return this.conversationService.searchConversationMessages(
            conversationId,
            req.user?.userId,
            query,
            limit
        );
    }
}