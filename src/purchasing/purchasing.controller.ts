import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { PurchasingService } from './purchasing.service';
import { CreatePurchaseDto } from './dtos/create-purchase.dto';
import { CreateSupplierDto } from './dtos/create-supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/interfaces/auth-payload.interface';
import {
    IPurchase,
    IUpdatePurchase,
    ISupplier,
    IUpdateSupplier,
    IPurchaseReport,
    PurchaseStatus,
} from './interfaces/purchase.interface';

@Controller('purchasing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchasingController {
    constructor(private readonly purchasingService: PurchasingService) { }

    // Purchase Management Endpoints
    @Post('purchases')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async createPurchase(
        @Body() createPurchaseDto: CreatePurchaseDto,
        @Request() req,
    ): Promise<IPurchase> {
        return this.purchasingService.createPurchase(
            createPurchaseDto,
            req.user.userId,
            req.user.username,
        );
    }
    @Get('purchases')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async findAllPurchases(): Promise<IPurchase[]> {
        return this.purchasingService.findAllPurchases();
    }

    @Get('purchases/:id')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async findPurchaseById(@Param('id') id: string): Promise<IPurchase> {
        return this.purchasingService.findPurchaseById(id);
    }

    @Get('purchases/number/:purchaseNumber')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async findPurchaseByNumber(
        @Param('purchaseNumber') purchaseNumber: string,
    ): Promise<IPurchase> {
        return this.purchasingService.findPurchaseByNumber(purchaseNumber);
    }

    @Get('purchases/supplier/:supplierId')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async findPurchasesBySupplier(
        @Param('supplierId') supplierId: string,
    ): Promise<IPurchase[]> {
        return this.purchasingService.findPurchasesBySupplier(supplierId);
    }

    @Get('purchases/status/:status')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async findPurchasesByStatus(
        @Param('status') status: PurchaseStatus,
    ): Promise<IPurchase[]> {
        return this.purchasingService.findPurchasesByStatus(status);
    }

    @Put('purchases/:id')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async updatePurchase(
        @Param('id') id: string,
        @Body() updatePurchaseDto: IUpdatePurchase,
    ): Promise<IPurchase> {
        return this.purchasingService.updatePurchase(id, updatePurchaseDto);
    }

    @Delete('purchases/:id')
    @Roles(UserRole.ADMIN)
    async deletePurchase(@Param('id') id: string): Promise<{ message: string }> {
        await this.purchasingService.deletePurchase(id);
        return { message: 'Purchase deleted successfully' };
    }

    @Post('purchases/:id/receive')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async receivePurchase(
        @Param('id') id: string,
        @Body() receivedItems: Array<{ itemId: string; receivedQuantity: number }>,
    ): Promise<IPurchase> {
        return this.purchasingService.receivePurchase(id, receivedItems);
    }

    // Supplier Management Endpoints
    @Post('suppliers')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async createSupplier(
        @Body() createSupplierDto: CreateSupplierDto,
    ): Promise<ISupplier> {
        return this.purchasingService.createSupplier(createSupplierDto);
    }

    @Get('suppliers')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async findAllSuppliers(): Promise<ISupplier[]> {
        return this.purchasingService.findAllSuppliers();
    }

    @Get('suppliers/:id')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async findSupplierById(@Param('id') id: string): Promise<ISupplier> {
        return this.purchasingService.findSupplierById(id);
    }

    @Put('suppliers/:id')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async updateSupplier(
        @Param('id') id: string,
        @Body() updateSupplierDto: IUpdateSupplier,
    ): Promise<ISupplier> {
        return this.purchasingService.updateSupplier(id, updateSupplierDto);
    }

    @Delete('suppliers/:id')
    @Roles(UserRole.ADMIN)
    async deleteSupplier(@Param('id') id: string): Promise<{ message: string }> {
        await this.purchasingService.deleteSupplier(id);
        return { message: 'Supplier deleted successfully' };
    }

    // Reports Endpoints
    @Get('reports/purchases')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async getPurchaseReport(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ): Promise<IPurchaseReport> {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.purchasingService.getPurchaseReport(start, end);
    }

    @Get('reports/overdue')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async getOverduePurchases(): Promise<IPurchase[]> {
        return this.purchasingService.getOverduePurchases();
    }

    @Get('reports/dashboard')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async getDashboardStats(): Promise<any> {
        const [purchaseReport, overduePurchases] = await Promise.all([
            this.purchasingService.getPurchaseReport(),
            this.purchasingService.getOverduePurchases(),
        ]);

        return {
            purchaseReport,
            overduePurchases: overduePurchases.length,
            overdueAmount: overduePurchases.reduce(
                (sum, purchase) => sum + purchase.remainingAmount,
                0,
            ),
        };
    }

    // Search and Filter Endpoints
    @Get('search/purchases')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async searchPurchases(
        @Query('supplierId') supplierId?: string,
        @Query('status') status?: PurchaseStatus,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ): Promise<IPurchase[]> {
        let purchases = await this.purchasingService.findAllPurchases();

        if (supplierId) {
            purchases = purchases.filter(
                (purchase) => purchase.supplierId === supplierId,
            );
        }

        if (status) {
            purchases = purchases.filter(
                (purchase) => purchase.purchaseStatus === status,
            );
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            purchases = purchases.filter(
                (purchase) => purchase.orderDate >= start && purchase.orderDate <= end,
            );
        }

        return purchases;
    }

    @Get('analytics/top-suppliers')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async getTopSuppliers(@Query('limit') limit: number = 10): Promise<any> {
        const purchaseReport = await this.purchasingService.getPurchaseReport();
        return purchaseReport.topSuppliers.slice(0, limit);
    }

    @Get('analytics/purchase-trend')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async getPurchaseTrend(@Query('months') months: number = 12): Promise<any> {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const purchaseReport = await this.purchasingService.getPurchaseReport(
            startDate,
            endDate,
        );
        return purchaseReport.purchasesByPeriod;
    }

    @Get('analytics/supplier-performance')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async getSupplierPerformance(): Promise<any> {
        const purchases = await this.purchasingService.findAllPurchases();
        const supplierStats = new Map<
            string,
            { name: string; purchases: number; total: number }
        >();

        purchases.forEach((purchase) => {
            const existing = supplierStats.get(purchase.supplierId) || {
                name: purchase.supplierName,
                purchases: 0,
                total: 0,
            };
            existing.purchases += 1;
            existing.total += purchase.totalAmount;
            supplierStats.set(purchase.supplierId, existing);
        });

        return Array.from(supplierStats.entries())
            .map(([supplierId, stats]) => ({
                supplierId,
                supplierName: stats.name,
                purchases: stats.purchases,
                totalAmount: stats.total,
                averageAmount: stats.total / stats.purchases,
            }))
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 10);
    }

    // Utility Endpoints
    @Get('next-purchase-number')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async getNextPurchaseNumber(): Promise<{ purchaseNumber: string }> {
        const year = new Date().getFullYear();
        return Promise.resolve({ purchaseNumber: `PO-${year}-0001` });
    }

    @Post('purchases/:id/approve')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async approvePurchase(@Param('id') id: string): Promise<IPurchase> {
        return this.purchasingService.updatePurchase(id, {
            purchaseStatus: PurchaseStatus.APPROVED,
        });
    }

    @Post('purchases/:id/order')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async orderPurchase(@Param('id') id: string): Promise<IPurchase> {
        return this.purchasingService.updatePurchase(id, {
            purchaseStatus: PurchaseStatus.ORDERED,
        });
    }

    @Post('purchases/:id/cancel')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async cancelPurchase(@Param('id') id: string): Promise<IPurchase> {
        return this.purchasingService.updatePurchase(id, {
            purchaseStatus: PurchaseStatus.CANCELLED,
        });
    }

    @Post('purchases/:id/mark-overdue')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    async markPurchaseOverdue(@Param('id') id: string): Promise<IPurchase> {
        return this.purchasingService.updatePurchase(id, {
            purchaseStatus: PurchaseStatus.ORDERED,
        });
    }
}
