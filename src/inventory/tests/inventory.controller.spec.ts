import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from '../inventory.controller';
import { InventoryService } from '../inventory.service';
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

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  const mockInventoryService = {
    createProduct: jest.fn(),
    findAllProducts: jest.fn(),
    findProductById: jest.fn(),
    findProductBySku: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
    adjustStock: jest.fn(),
    createBatch: jest.fn(),
    getBatchesByProduct: jest.fn(),
    getExpiringBatches: jest.fn(),
    getLowStockProducts: jest.fn(),
    getStockMovements: jest.fn(),
    getABCClassificationReport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get<InventoryService>(InventoryService);
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

    it('should create a new product', async () => {
      const mockProduct = {
        id: 'product-id',
        ...createProductDto,
        classification: ProductClassification.C,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockInventoryService.createProduct.mockResolvedValue(mockProduct);

      const result = await controller.createProduct(createProductDto);

      expect(service.createProduct).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(mockProduct);
    });

    it('should handle service errors', async () => {
      mockInventoryService.createProduct.mockRejectedValue(
        new ConflictException('SKU already exists'),
      );

      await expect(controller.createProduct(createProductDto)).rejects.toThrow(
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

      mockInventoryService.findAllProducts.mockResolvedValue(mockProducts);

      const result = await controller.findAllProducts();

      expect(service.findAllProducts).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
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

      mockInventoryService.findProductById.mockResolvedValue(mockProduct);

      const result = await controller.findProductById('product-id');

      expect(service.findProductById).toHaveBeenCalledWith('product-id');
      expect(result).toEqual(mockProduct);
    });

    it('should handle product not found', async () => {
      mockInventoryService.findProductById.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(controller.findProductById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findProductBySku', () => {
    it('should return product by SKU', async () => {
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

      mockInventoryService.findProductBySku.mockResolvedValue(mockProduct);

      const result = await controller.findProductBySku('TEST001');

      expect(service.findProductBySku).toHaveBeenCalledWith('TEST001');
      expect(result).toEqual(mockProduct);
    });
  });

  describe('updateProduct', () => {
    const updateProductDto: UpdateProductDto = {
      name: 'Updated Product',
      sellingPrice: 20.0,
    };

    it('should update product successfully', async () => {
      const mockProduct = {
        id: 'product-id',
        sku: 'TEST001',
        name: 'Updated Product',
        unitCost: 10,
        sellingPrice: 20,
        stock: 100,
        classification: ProductClassification.C,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockInventoryService.updateProduct.mockResolvedValue(mockProduct);

      const result = await controller.updateProduct(
        'product-id',
        updateProductDto,
      );

      expect(service.updateProduct).toHaveBeenCalledWith(
        'product-id',
        updateProductDto,
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      mockInventoryService.deleteProduct.mockResolvedValue(undefined);

      const result = await controller.deleteProduct('product-id');

      expect(service.deleteProduct).toHaveBeenCalledWith('product-id');
      expect(result).toEqual({ message: 'Product deleted successfully' });
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
        stock: 110,
        classification: ProductClassification.C,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRequest = {
        user: { userId: 'user-id', username: 'testuser' },
      };

      mockInventoryService.adjustStock.mockResolvedValue(mockProduct);

      const result = await controller.adjustStock(
        stockAdjustmentDto,
        mockRequest,
      );

      expect(service.adjustStock).toHaveBeenCalledWith(
        stockAdjustmentDto,
        'user-id',
        'testuser',
      );
      expect(result).toEqual(mockProduct);
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
      const mockBatch = {
        id: 'batch-id',
        batchId: 'BATCH001',
        productId: 'product-id',
        expiryDate: new Date('2024-12-31'),
        quantity: 50,
        remainingQuantity: 50,
        cost: 8.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockInventoryService.createBatch.mockResolvedValue(mockBatch);

      const result = await controller.createBatch(createBatchDto);

      expect(service.createBatch).toHaveBeenCalledWith(createBatchDto);
      expect(result).toEqual(mockBatch);
    });
  });

  describe('getBatchesByProduct', () => {
    it('should return batches for product', async () => {
      const mockBatches = [
        {
          id: 'batch-1',
          batchId: 'BATCH001',
          productId: 'product-id',
          expiryDate: new Date('2024-12-31'),
          quantity: 50,
          remainingQuantity: 50,
          cost: 8.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockInventoryService.getBatchesByProduct.mockResolvedValue(mockBatches);

      const result = await controller.getBatchesByProduct('product-id');

      expect(service.getBatchesByProduct).toHaveBeenCalledWith('product-id');
      expect(result).toEqual(mockBatches);
    });
  });

  describe('getExpiringBatches', () => {
    it('should return expiring batches', async () => {
      const mockExpiringBatches = [
        {
          batchId: 'BATCH001',
          productName: 'Test Product',
          expiryDate: new Date('2024-01-15'),
          remainingQuantity: 10,
          daysUntilExpiry: 5,
        },
      ];

      mockInventoryService.getExpiringBatches.mockResolvedValue(
        mockExpiringBatches,
      );

      const result = await controller.getExpiringBatches(7);

      expect(service.getExpiringBatches).toHaveBeenCalledWith(7);
      expect(result).toEqual(mockExpiringBatches);
    });
  });

  describe('getLowStockProducts', () => {
    it('should return low stock products', async () => {
      const mockLowStockProducts = [
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

      mockInventoryService.getLowStockProducts.mockResolvedValue(
        mockLowStockProducts,
      );

      const result = await controller.getLowStockProducts();

      expect(service.getLowStockProducts).toHaveBeenCalled();
      expect(result).toEqual(mockLowStockProducts);
    });
  });

  describe('getStockMovements', () => {
    it('should return stock movements', async () => {
      const mockMovements = [
        {
          id: 'movement-1',
          productId: 'product-id',
          productName: 'Test Product',
          type: 'ADJUSTMENT',
          quantity: 10,
          reason: 'Test adjustment',
          createdAt: new Date(),
        },
      ];

      mockInventoryService.getStockMovements.mockResolvedValue(mockMovements);

      const result = await controller.getStockMovements(
        'product-id',
        'ADJUSTMENT',
        50,
      );

      expect(service.getStockMovements).toHaveBeenCalledWith(
        'product-id',
        'ADJUSTMENT',
        50,
      );
      expect(result).toEqual(mockMovements);
    });
  });

  describe('getABCClassificationReport', () => {
    it('should return ABC classification report', async () => {
      const mockReport = {
        A: { count: 1, totalValue: 1000, products: [] },
        B: { count: 2, totalValue: 500, products: [] },
        C: { count: 3, totalValue: 100, products: [] },
      };

      mockInventoryService.getABCClassificationReport.mockResolvedValue(
        mockReport,
      );

      const result = await controller.getABCClassificationReport();

      expect(service.getABCClassificationReport).toHaveBeenCalled();
      expect(result).toEqual(mockReport);
    });
  });

  describe('getStockValueReport', () => {
    it('should return stock value report', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          sku: 'TEST001',
          name: 'Product 1',
          unitCost: 10,
          stock: 100,
          category: 'Electronics',
          classification: ProductClassification.C,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockInventoryService.findAllProducts.mockResolvedValue(mockProducts);

      const result = await controller.getStockValueReport();

      expect(service.findAllProducts).toHaveBeenCalled();
      expect(result.totalProducts).toBe(1);
      expect(result.totalValue).toBe(1000);
      expect(result.categoryBreakdown).toHaveProperty('Electronics');
    });
  });

  describe('getStockAlerts', () => {
    it('should return stock alerts', async () => {
      const mockLowStockProducts = [
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

      const mockExpiringBatches = [
        {
          batchId: 'BATCH001',
          productName: 'Test Product',
          expiryDate: new Date('2024-01-15'),
          remainingQuantity: 10,
          daysUntilExpiry: 5,
        },
      ];

      mockInventoryService.getLowStockProducts.mockResolvedValue(
        mockLowStockProducts,
      );
      mockInventoryService.getExpiringBatches.mockResolvedValue(
        mockExpiringBatches,
      );

      const result = await controller.getStockAlerts();

      expect(service.getLowStockProducts).toHaveBeenCalled();
      expect(service.getExpiringBatches).toHaveBeenCalledWith(7);
      expect(result.lowStockCount).toBe(1);
      expect(result.expiringCount).toBe(1);
    });
  });

  describe('searchProducts', () => {
    it('should return filtered products', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          sku: 'TEST001',
          name: 'Test Product',
          unitCost: 10,
          sellingPrice: 15,
          stock: 100,
          category: 'Electronics',
          classification: ProductClassification.C,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockInventoryService.findAllProducts.mockResolvedValue(mockProducts);

      const result = await controller.searchProducts(
        'Test',
        'Electronics',
        'C',
        'Supplier',
      );

      expect(service.findAllProducts).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Product');
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          sku: 'TEST001',
          name: 'Product 1',
          category: 'Electronics',
          unitCost: 10,
          sellingPrice: 15,
          stock: 100,
          classification: ProductClassification.C,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'product-2',
          sku: 'TEST002',
          name: 'Product 2',
          category: 'Clothing',
          unitCost: 10,
          sellingPrice: 15,
          stock: 100,
          classification: ProductClassification.C,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockInventoryService.findAllProducts.mockResolvedValue(mockProducts);

      const result = await controller.getCategories();

      expect(service.findAllProducts).toHaveBeenCalled();
      expect(result).toEqual(['Clothing', 'Electronics']);
    });
  });

  describe('getSuppliers', () => {
    it('should return unique suppliers', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          sku: 'TEST001',
          name: 'Product 1',
          supplier: 'Supplier A',
          unitCost: 10,
          sellingPrice: 15,
          stock: 100,
          classification: ProductClassification.C,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'product-2',
          sku: 'TEST002',
          name: 'Product 2',
          supplier: 'Supplier B',
          unitCost: 10,
          sellingPrice: 15,
          stock: 100,
          classification: ProductClassification.C,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockInventoryService.findAllProducts.mockResolvedValue(mockProducts);

      const result = await controller.getSuppliers();

      expect(service.findAllProducts).toHaveBeenCalled();
      expect(result).toEqual(['Supplier A', 'Supplier B']);
    });
  });
});
