import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryService } from '../inventory.service';
import { Product } from '../entities/product.entity';
import { Batch } from '../entities/batch.entity';
import { StockMovement, MovementType } from '../entities/stock-movement.entity';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { StockAdjustmentDto } from '../dtos/stock-adjustment.dto';
import { CreateBatchDto } from '../dtos/create-batch.dto';
import { ProductClassification } from '../interfaces/product.interface';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

describe('InventoryService', () => {
  let service: InventoryService;
  let productRepository: Repository<Product>;
  let batchRepository: Repository<Batch>;
  let stockMovementRepository: Repository<StockMovement>;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockBatchRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockStockMovementRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Batch),
          useValue: mockBatchRepository,
        },
        {
          provide: getRepositoryToken(StockMovement),
          useValue: mockStockMovementRepository,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    batchRepository = module.get<Repository<Batch>>(getRepositoryToken(Batch));
    stockMovementRepository = module.get<Repository<StockMovement>>(
      getRepositoryToken(StockMovement),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    const createProductDto: CreateProductDto = {
      sku: 'TEST001',
      name: 'Test Product',
      description: 'Test description',
      unitCost: 10.0,
      sellingPrice: 15.0,
      stock: 100,
      minStock: 10,
      maxStock: 500,
      category: 'Electronics',
      supplier: 'Test Supplier',
    };

    it('should create a new product successfully', async () => {
      const mockProduct = {
        id: 'product-id',
        ...createProductDto,
        classification: ProductClassification.C,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductRepository.findOne.mockResolvedValue(null);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      mockStockMovementRepository.create.mockReturnValue({});
      mockStockMovementRepository.save.mockResolvedValue({});

      const result = await service.createProduct(createProductDto);

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { sku: 'TEST001' },
      });
      expect(mockProductRepository.create).toHaveBeenCalledWith(
        createProductDto,
      );
      expect(mockProductRepository.save).toHaveBeenCalledWith(mockProduct);
      expect(result.sku).toBe('TEST001');
      expect(result.name).toBe('Test Product');
    });

    it('should throw ConflictException if SKU already exists', async () => {
      const existingProduct = { id: 'existing-id', sku: 'TEST001' };

      mockProductRepository.findOne.mockResolvedValue(existingProduct);

      await expect(service.createProduct(createProductDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAllProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          sku: 'TEST001',
          name: 'Product 1',
          unitCost: 10,
          sellingPrice: 15,
          stock: 100,
          classification: ProductClassification.C,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockProductRepository.find.mockResolvedValue(mockProducts);

      const result = await service.findAllProducts();

      expect(mockProductRepository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].sku).toBe('TEST001');
    });
  });

  describe('findProductById', () => {
    it('should return product by id', async () => {
      const mockProduct = {
        id: 'product-id',
        sku: 'TEST001',
        name: 'Test Product',
        unitCost: 10,
        sellingPrice: 15,
        stock: 100,
        classification: ProductClassification.C,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findProductById('product-id');

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'product-id' },
      });
      expect(result.id).toBe('product-id');
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findProductById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProduct', () => {
    const updateProductDto: UpdateProductDto = {
      name: 'Updated Product',
      sellingPrice: 20.0,
    };

    it('should update product successfully', async () => {
      const existingProduct = {
        id: 'product-id',
        sku: 'TEST001',
        name: 'Test Product',
        unitCost: 10,
        sellingPrice: 15,
        stock: 100,
        classification: ProductClassification.C,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProduct = { ...existingProduct, ...updateProductDto };

      mockProductRepository.findOne.mockResolvedValue(existingProduct);
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.updateProduct(
        'product-id',
        updateProductDto,
      );

      expect(mockProductRepository.save).toHaveBeenCalledWith(updatedProduct);
      expect(result.name).toBe('Updated Product');
      expect(result.sellingPrice).toBe(20.0);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProduct('non-existent', updateProductDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const mockProduct = {
        id: 'product-id',
        sku: 'TEST001',
        name: 'Test Product',
        stock: 0,
        isActive: true,
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.remove.mockResolvedValue(mockProduct);

      await service.deleteProduct('product-id');

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'product-id' },
      });
      expect(mockProductRepository.remove).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw BadRequestException if product has stock', async () => {
      const mockProduct = {
        id: 'product-id',
        sku: 'TEST001',
        name: 'Test Product',
        stock: 10,
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      await expect(service.deleteProduct('product-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('adjustStock', () => {
    const stockAdjustmentDto: StockAdjustmentDto = {
      productId: 'product-id',
      quantity: 10,
      reason: 'Test adjustment',
      type: 'IN',
    };

    it('should adjust stock successfully', async () => {
      const mockProduct = {
        id: 'product-id',
        sku: 'TEST001',
        name: 'Test Product',
        unitCost: 10,
        sellingPrice: 15,
        stock: 100,
        classification: ProductClassification.C,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProduct = { ...mockProduct, stock: 110 };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(updatedProduct);
      mockStockMovementRepository.create.mockReturnValue({});
      mockStockMovementRepository.save.mockResolvedValue({});

      const result = await service.adjustStock(stockAdjustmentDto);

      expect(mockProductRepository.save).toHaveBeenCalledWith(updatedProduct);
      expect(result.stock).toBe(110);
    });

    it('should throw BadRequestException for insufficient stock', async () => {
      const stockAdjustmentDto: StockAdjustmentDto = {
        productId: 'product-id',
        quantity: 150,
        reason: 'Test adjustment',
        type: 'OUT',
      };

      const mockProduct = {
        id: 'product-id',
        sku: 'TEST001',
        name: 'Test Product',
        stock: 100,
        unitCost: 10,
        classification: ProductClassification.C,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      await expect(service.adjustStock(stockAdjustmentDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createBatch', () => {
    const createBatchDto: CreateBatchDto = {
      batchId: 'BATCH001',
      productId: 'product-id',
      expiryDate: '2024-12-31',
      quantity: 50,
      cost: 8.0,
    };

    it('should create batch successfully', async () => {
      const mockProduct = {
        id: 'product-id',
        sku: 'TEST001',
        name: 'Test Product',
        stock: 100,
        unitCost: 10,
        classification: ProductClassification.C,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockBatch = {
        id: 'batch-id',
        ...createBatchDto,
        expiryDate: new Date(createBatchDto.expiryDate),
        remainingQuantity: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBatchRepository.findOne.mockResolvedValue(null);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockBatchRepository.create.mockReturnValue(mockBatch);
      mockBatchRepository.save.mockResolvedValue(mockBatch);
      mockProductRepository.save.mockResolvedValue({
        ...mockProduct,
        stock: 150,
      });
      mockStockMovementRepository.create.mockReturnValue({});
      mockStockMovementRepository.save.mockResolvedValue({});

      const result = await service.createBatch(createBatchDto);

      expect(mockBatchRepository.findOne).toHaveBeenCalledWith({
        where: { batchId: 'BATCH001' },
      });
      expect(mockBatchRepository.create).toHaveBeenCalled();
      expect(result.batchId).toBe('BATCH001');
    });

    it('should throw ConflictException if batch ID already exists', async () => {
      const existingBatch = { id: 'existing-batch', batchId: 'BATCH001' };

      mockBatchRepository.findOne.mockResolvedValue(existingBatch);

      await expect(service.createBatch(createBatchDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getLowStockProducts', () => {
    it('should return products with low stock', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          sku: 'TEST001',
          name: 'Product 1',
          stock: 5,
          minStock: 10,
          unitCost: 10,
          classification: ProductClassification.C,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockProducts),
      };

      mockProductRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getLowStockProducts();

      expect(mockProductRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].stock).toBe(5);
    });
  });

  describe('getExpiringBatches', () => {
    it('should return expiring batches', async () => {
      const mockBatches = [
        {
          id: 'batch-1',
          batchId: 'BATCH001',
          productId: 'product-1',
          expiryDate: new Date('2024-01-15'),
          remainingQuantity: 10,
          product: { name: 'Test Product' },
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockBatches),
      };

      mockBatchRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getExpiringBatches(30);

      expect(mockBatchRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].batchId).toBe('BATCH001');
    });
  });

  describe('getABCClassificationReport', () => {
    it('should return ABC classification report', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          sku: 'TEST001',
          name: 'Product A',
          unitCost: 100,
          stock: 10,
          classification: ProductClassification.A,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'product-2',
          sku: 'TEST002',
          name: 'Product B',
          unitCost: 50,
          stock: 20,
          classification: ProductClassification.B,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockProductRepository.find.mockResolvedValue(mockProducts);

      const result = await service.getABCClassificationReport();

      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { classification: 'ASC' },
      });
      expect(result.A.count).toBe(1);
      expect(result.B.count).toBe(1);
      expect(result.C.count).toBe(0);
    });
  });
});
