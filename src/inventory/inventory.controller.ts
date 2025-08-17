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
import { InventoryService } from './inventory.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { StockAdjustmentDto } from './dtos/stock-adjustment.dto';
import { CreateBatchDto } from './dtos/create-batch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/interfaces/auth-payload.interface';
import {
  IProduct,
  ICreateProduct,
  IUpdateProduct,
} from './interfaces/product.interface';
import {
  IBatch,
  ICreateBatch,
  IBatchExpiry,
} from './interfaces/batch.interface';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  // Product Management Endpoints
  @Post('products')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<IProduct> {
    return this.inventoryService.createProduct(createProductDto);
  }

  @Get('products')
  async findAllProducts(): Promise<IProduct[]> {
    return this.inventoryService.findAllProducts();
  }

  @Get('products/:id')
  async findProductById(@Param('id') id: string): Promise<IProduct> {
    return this.inventoryService.findProductById(id);
  }

  @Get('products/sku/:sku')
  async findProductBySku(@Param('sku') sku: string): Promise<IProduct> {
    return this.inventoryService.findProductBySku(sku);
  }

  @Put('products/:id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<IProduct> {
    return this.inventoryService.updateProduct(id, updateProductDto);
  }

  @Delete('products/:id')
  @Roles(UserRole.ADMIN)
  async deleteProduct(@Param('id') id: string): Promise<{ message: string }> {
    await this.inventoryService.deleteProduct(id);
    return { message: 'Product deleted successfully' };
  }

  // Stock Management Endpoints
  @Post('stock/adjust')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.CASHIER)
  async adjustStock(
    @Body() stockAdjustmentDto: StockAdjustmentDto,
    @Request() req,
  ): Promise<IProduct> {
    return this.inventoryService.adjustStock(
      stockAdjustmentDto,
      req.user.userId,
      req.user.username,
    );
  }

  @Get('stock/low-stock')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async getLowStockProducts(): Promise<IProduct[]> {
    return this.inventoryService.getLowStockProducts();
  }

  @Get('stock/movements')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async getStockMovements(
    @Query('productId') productId?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: number,
  ): Promise<any[]> {
    return this.inventoryService.getStockMovements(
      productId,
      type as any,
      limit,
    );
  }

  // Batch Management Endpoints
  @Post('batches')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async createBatch(@Body() createBatchDto: CreateBatchDto): Promise<IBatch> {
    return this.inventoryService.createBatch(createBatchDto);
  }

  @Get('batches/product/:productId')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async getBatchesByProduct(
    @Param('productId') productId: string,
  ): Promise<IBatch[]> {
    return this.inventoryService.getBatchesByProduct(productId);
  }

  @Get('batches/expiring')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async getExpiringBatches(
    @Query('days') days?: number,
  ): Promise<IBatchExpiry[]> {
    return this.inventoryService.getExpiringBatches(days);
  }

  // Reports Endpoints
  @Get('reports/abc-classification')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async getABCClassificationReport(): Promise<any> {
    return this.inventoryService.getABCClassificationReport();
  }

  @Get('reports/stock-value')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async getStockValueReport(): Promise<any> {
    const products = await this.inventoryService.findAllProducts();

    const totalValue = products.reduce(
      (sum, product) => sum + product.unitCost * product.stock,
      0,
    );

    const categoryBreakdown = products.reduce(
      (acc, product) => {
        const category = product.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = { count: 0, value: 0 };
        }
        acc[category].count += 1;
        acc[category].value += product.unitCost * product.stock;
        return acc;
      },
      {} as Record<string, { count: number; value: number }>,
    );

    return {
      totalProducts: products.length,
      totalValue,
      categoryBreakdown,
      averageValue: totalValue / products.length,
    };
  }

  @Get('reports/stock-alerts')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async getStockAlerts(): Promise<any> {
    const lowStockProducts = await this.inventoryService.getLowStockProducts();
    const expiringBatches = await this.inventoryService.getExpiringBatches(7); // 7 days

    return {
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        currentStock: p.stock,
        minStock: p.minStock,
        deficit: p.minStock - p.stock,
      })),
      expiringCount: expiringBatches.length,
      expiringBatches: expiringBatches.map((b) => ({
        batchId: b.batchId,
        productName: b.productName,
        expiryDate: b.expiryDate,
        remainingQuantity: b.remainingQuantity,
        daysUntilExpiry: b.daysUntilExpiry,
      })),
    };
  }

  // Search and Filter Endpoints
  @Get('search')
  async searchProducts(
    @Query('q') query?: string,
    @Query('category') category?: string,
    @Query('classification') classification?: string,
    @Query('supplier') supplier?: string,
  ): Promise<IProduct[]> {
    const products = await this.inventoryService.findAllProducts();

    let filteredProducts = products;

    if (query) {
      const searchTerm = query.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.sku.toLowerCase().includes(searchTerm) ||
          p.description?.toLowerCase().includes(searchTerm),
      );
    }

    if (category) {
      filteredProducts = filteredProducts.filter(
        (p) => p.category === category,
      );
    }

    if (classification) {
      filteredProducts = filteredProducts.filter(
        (p) => p.classification === classification,
      );
    }

    if (supplier) {
      filteredProducts = filteredProducts.filter(
        (p) => p.supplier === supplier,
      );
    }

    return filteredProducts;
  }

  @Get('categories')
  async getCategories(): Promise<string[]> {
    const products = await this.inventoryService.findAllProducts();
    const categories = [
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ];
    return categories.sort() as string[];
  }

  @Get('suppliers')
  async getSuppliers(): Promise<string[]> {
    const products = await this.inventoryService.findAllProducts();
    const suppliers = [
      ...new Set(products.map((p) => p.supplier).filter(Boolean)),
    ];
    return suppliers.sort() as string[];
  }
}
