import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { AdminService, SyncStatus } from "../services/admin.service";
import { ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { UserRole } from "../../auth/interfaces/auth-payload.interface";

@ApiTags('AI Admin Performance Panel')
@Controller('ai-admin-panel')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
export class AiAdminPanelController {
    constructor(private readonly adminService: AdminService) { }

    @Get('admin/sync-status')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get data synchronization status' })
    @ApiResponse({ status: 200, description: 'Current sync status' })
    async getSyncStatus(): Promise<Map<string, SyncStatus>> {
        const syncStatus = await this.adminService.getSyncStatus();
        return Promise.resolve(syncStatus);
    }

    @Get('admin/health')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get detailed AI agent health status' })
    @ApiResponse({ status: 200, description: 'Detailed health status' })
    async getDetailedHealth() {
        return this.adminService.getServiceHealth();
    }

    @Get('admin/data-quality')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get data quality report' })
    @ApiResponse({ status: 200, description: 'Data quality metrics' })
    async getDataQualityReport() {
        return this.adminService.getDataQualityReport();
    }

    @Get('admin/performance')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get performance metrics' })
    @ApiResponse({ status: 200, description: 'Performance metrics' })
    async getPerformanceMetrics() {
        return this.adminService.getPerformanceMetrics();
    }

    @Post('admin/sync/:entityType')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Force sync specific entity type' })
    @ApiResponse({ status: 200, description: 'Sync initiated' })
    @ApiParam({ name: 'entityType', description: 'Type of entity to sync' })
    async forceSyncEntity(@Param('entityType') entityType: string) {
        return this.adminService.forceSyncEntity(entityType);
    }

    @Delete('admin/vector-store')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Clear vector store (dangerous operation)' })
    @ApiResponse({ status: 200, description: 'Vector store cleared' })
    async clearVectorStore() {
        return this.adminService.clearVectorStore();
    }

    @Get('debug/similar/:query')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Debug: Search similar content' })
    @ApiResponse({ status: 200, description: 'Similar content' })
    @ApiParam({ name: 'query', description: 'Query to find similar content' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async searchSimilarContent(
        @Param('query') query: string,
        @Query('limit') limit = 10
    ) {
        return this.adminService.searchSimilarContent(query, limit);
    }
}