import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Product } from './entities/product.entity';
import { Batch } from './entities/batch.entity';
import { StockMovement, MovementType } from './entities/stock-movement.entity';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { StockAdjustmentDto } from './dtos/stock-adjustment.dto';
import { CreateBatchDto } from './dtos/create-batch.dto';
import {
  IProduct,
  ICreateProduct,
  IUpdateProduct,
  ProductClassification,
} from './interfaces/product.interface';
import {
  IBatch,
  ICreateBatch,
  IBatchExpiry,
} from './interfaces/batch.interface';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<IProduct> {
    const { sku } = createProductDto;

    // Check if product with SKU already exists
    const existingProduct = await this.productRepository.findOne({
      where: { sku },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this SKU already exists');
    }

    const product = this.productRepository.create(createProductDto);

    // Calculate ABC classification based on value
    product.classification = this.calculateABCClassification(
      product.unitCost * product.stock,
    );

    const savedProduct = await this.productRepository.save(product);

    // Record initial stock movement
    if (product.stock > 0) {
      await this.recordStockMovement({
        productId: savedProduct.id,
        type: MovementType.ADJUSTMENT,
        quantity: product.stock,
        reason: 'Initial stock',
        unitPrice: product.unitCost,
        totalValue: product.unitCost * product.stock,
      });
    }

    return this.mapProductToInterface(savedProduct);
  }

  async findAllProducts(): Promise<IProduct[]> {
    const products = await this.productRepository.find({
      order: { name: 'ASC' },
    });

    return products.map((product) => this.mapProductToInterface(product));
  }

  async findProductById(id: string): Promise<IProduct> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapProductToInterface(product);
  }

  async findProductBySku(sku: string): Promise<IProduct> {
    const product = await this.productRepository.findOne({ where: { sku } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapProductToInterface(product);
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<IProduct> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    Object.assign(product, updateProductDto);

    // Recalculate ABC classification if cost or stock changed
    if (
      updateProductDto.unitCost !== undefined
    ) {
      product.classification = this.calculateABCClassification(
        product.unitCost * product.stock,
      );
    }

    const updatedProduct = await this.productRepository.save(product);

    return this.mapProductToInterface(updatedProduct);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if product has stock
    if (product.stock > 0) {
      throw new BadRequestException(
        'Cannot delete product with existing stock',
      );
    }

    await this.productRepository.remove(product);
  }

  async adjustStock(
    stockAdjustmentDto: StockAdjustmentDto,
    userId?: string,
    userName?: string,
  ): Promise<IProduct> {
    const { productId, quantity, reason, type, reference, batchId } =
      stockAdjustmentDto;

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Validate stock adjustment
    if (type === 'OUT' && quantity > product.stock) {
      throw new BadRequestException('Insufficient stock for adjustment');
    }

    // Update product stock
    const stockChange = type === 'IN' ? quantity : -quantity;
    product.stock += stockChange;

    if (product.stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    // Recalculate ABC classification
    product.classification = this.calculateABCClassification(
      product.unitCost * product.stock,
    );

    const updatedProduct = await this.productRepository.save(product);

    // Record stock movement
    await this.recordStockMovement({
      productId,
      type: MovementType.ADJUSTMENT,
      quantity: type === 'IN' ? quantity : -quantity,
      reason,
      reference,
      batchId,
      unitPrice: product.unitCost,
      totalValue: product.unitCost * Math.abs(quantity),
      userId,
      userName,
    });

    return this.mapProductToInterface(updatedProduct);
  }

  async createBatch(createBatchDto: CreateBatchDto): Promise<IBatch> {
    const { batchId, productId } = createBatchDto;

    // Check if batch ID already exists
    const existingBatch = await this.batchRepository.findOne({
      where: { batchId },
    });

    if (existingBatch) {
      throw new ConflictException('Batch with this ID already exists');
    }

    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const batch = this.batchRepository.create({
      ...createBatchDto,
      expiryDate: new Date(createBatchDto.expiryDate),
      manufacturingDate: createBatchDto.manufacturingDate
        ? new Date(createBatchDto.manufacturingDate)
        : undefined,
      remainingQuantity: createBatchDto.quantity,
    });

    const savedBatch = await this.batchRepository.save(batch);

    // Update product stock
    product.stock += createBatchDto.quantity;
    product.classification = this.calculateABCClassification(
      product.unitCost * product.stock,
    );
    await this.productRepository.save(product);

    // Record stock movement
    await this.recordStockMovement({
      productId,
      type: MovementType.PURCHASE,
      quantity: createBatchDto.quantity,
      reason: `Batch ${batchId} received`,
      reference: batchId,
      batchId,
      unitPrice: createBatchDto.cost,
      totalValue: createBatchDto.cost * createBatchDto.quantity,
    });

    return this.mapBatchToInterface(savedBatch);
  }

  async getBatchesByProduct(productId: string): Promise<IBatch[]> {
    const batches = await this.batchRepository.find({
      where: { productId },
      order: { expiryDate: 'ASC' },
    });

    return batches.map((batch) => this.mapBatchToInterface(batch));
  }

  async getExpiringBatches(
    daysThreshold: number = 30,
  ): Promise<IBatchExpiry[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysThreshold);

    const batches = await this.batchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.product', 'product')
      .where('batch.expiryDate <= :expiryDate', { expiryDate })
      .andWhere('batch.remainingQuantity > 0')
      .orderBy('batch.expiryDate', 'ASC')
      .getMany();

    return batches.map((batch) => ({
      batchId: batch.batchId,
      productName: batch.product.name,
      expiryDate: batch.expiryDate,
      remainingQuantity: batch.remainingQuantity,
      daysUntilExpiry: Math.ceil(
        (batch.expiryDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    }));
  }

  async getLowStockProducts(): Promise<IProduct[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.stock <= product.minStock')
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.stock', 'ASC')
      .getMany();

    return products.map((product) => this.mapProductToInterface(product));
  }

  async getStockMovements(
    productId?: string,
    type?: MovementType,
    limit: number = 100,
  ): Promise<any[]> {
    const query = this.stockMovementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .orderBy('movement.createdAt', 'DESC')
      .limit(limit);

    if (productId) {
      query.andWhere('movement.productId = :productId', { productId });
    }

    if (type) {
      query.andWhere('movement.type = :type', { type });
    }

    const movements = await query.getMany();

    return movements.map((movement) => ({
      id: movement.id,
      productId: movement.productId,
      productName: movement.product?.name,
      type: movement.type,
      quantity: movement.quantity,
      unitPrice: movement.unitPrice,
      totalValue: movement.totalValue,
      reason: movement.reason,
      reference: movement.reference,
      batchId: movement.batchId,
      userName: movement.userName,
      createdAt: movement.createdAt,
    }));
  }

  async getABCClassificationReport(): Promise<any> {
    const products = await this.productRepository.find({
      where: { isActive: true },
      order: { classification: 'ASC' },
    });

    const classification = {
      A: products.filter((p) => p.classification === ProductClassification.A),
      B: products.filter((p) => p.classification === ProductClassification.B),
      C: products.filter((p) => p.classification === ProductClassification.C),
    };

    return {
      A: {
        count: classification.A.length,
        totalValue: classification.A.reduce(
          (sum, p) => sum + p.unitCost * p.stock,
          0,
        ),
        products: classification.A.map((p) => this.mapProductToInterface(p)),
      },
      B: {
        count: classification.B.length,
        totalValue: classification.B.reduce(
          (sum, p) => sum + p.unitCost * p.stock,
          0,
        ),
        products: classification.B.map((p) => this.mapProductToInterface(p)),
      },
      C: {
        count: classification.C.length,
        totalValue: classification.C.reduce(
          (sum, p) => sum + p.unitCost * p.stock,
          0,
        ),
        products: classification.C.map((p) => this.mapProductToInterface(p)),
      },
    };
  }

  private calculateABCClassification(
    totalValue: number,
  ): ProductClassification {
    // Simple ABC classification based on value thresholds
    // In a real system, this would be more sophisticated
    if (totalValue >= 10000) {
      return ProductClassification.A;
    } else if (totalValue >= 1000) {
      return ProductClassification.B;
    } else {
      return ProductClassification.C;
    }
  }

  private async recordStockMovement(movementData: {
    productId: string;
    type: MovementType;
    quantity: number;
    reason?: string;
    reference?: string;
    batchId?: string;
    unitPrice?: number;
    totalValue?: number;
    userId?: string;
    userName?: string;
  }): Promise<void> {
    const movement = this.stockMovementRepository.create(movementData);
    await this.stockMovementRepository.save(movement);
  }

  private mapProductToInterface(product: Product): IProduct {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      unitCost: Number(product.unitCost),
      sellingPrice: Number(product.sellingPrice),
      stock: product.stock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      classification: product.classification,
      category: product.category,
      supplier: product.supplier,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private mapBatchToInterface(batch: Batch): IBatch {
    return {
      id: batch.id,
      batchId: batch.batchId,
      productId: batch.productId,
      expiryDate: batch.expiryDate,
      quantity: batch.quantity,
      remainingQuantity: batch.remainingQuantity,
      manufacturingDate: batch.manufacturingDate,
      supplier: batch.supplier,
      cost: Number(batch.cost),
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
    };
  }
}
