import { Test, TestingModule } from '@nestjs/testing';
import { PurchasingController } from '../purchasing.controller';
import { PurchasingService } from '../purchasing.service';
import { CreatePurchaseDto } from '../dtos/create-purchase.dto';
import { CreateSupplierDto } from '../dtos/create-supplier.dto';
import {
  PurchaseStatus,
  PaymentStatus,
} from '../interfaces/purchase.interface';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

describe('PurchasingController', () => {
  let controller: PurchasingController;
  let service: PurchasingService;

  const mockPurchasingService = {
    createPurchase: jest.fn(),
    findAllPurchases: jest.fn(),
    findPurchaseById: jest.fn(),
    findPurchaseByNumber: jest.fn(),
    findPurchasesBySupplier: jest.fn(),
    findPurchasesByStatus: jest.fn(),
    updatePurchase: jest.fn(),
    deletePurchase: jest.fn(),
    receivePurchase: jest.fn(),
    createSupplier: jest.fn(),
    findAllSuppliers: jest.fn(),
    findSupplierById: jest.fn(),
    updateSupplier: jest.fn(),
    deleteSupplier: jest.fn(),
    getPurchaseReport: jest.fn(),
    getOverduePurchases: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasingController],
      providers: [
        {
          provide: PurchasingService,
          useValue: mockPurchasingService,
        },
      ],
    }).compile();

    controller = module.get<PurchasingController>(PurchasingController);
    service = module.get<PurchasingService>(PurchasingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPurchase', () => {
    const createPurchaseDto: CreatePurchaseDto = {
      supplierId: 'supplier-id',
      items: [
        {
          productId: 'product-id',
          productName: 'Test Product',
          productSku: 'TEST001',
          quantity: 2,
          unitCost: 50,
          notes: 'Test item',
        },
      ],
      taxRate: 10,
      shippingCost: 20,
      notes: 'Test purchase',
    };

    it('should create a new purchase', async () => {
      const mockPurchase = {
        id: 'purchase-id',
        purchaseNumber: 'PO-2024-0001',
        supplierId: 'supplier-id',
        totalAmount: 130,
        purchaseStatus: PurchaseStatus.DRAFT,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRequest = {
        user: { userId: 'user-id', username: 'testuser' },
      };

      mockPurchasingService.createPurchase.mockResolvedValue(mockPurchase);

      const result = await controller.createPurchase(
        createPurchaseDto,
        mockRequest,
      );

      expect(service.createPurchase).toHaveBeenCalledWith(
        createPurchaseDto,
        'user-id',
        'testuser',
      );
      expect(result).toEqual(mockPurchase);
    });

    it('should handle service errors', async () => {
      const mockRequest = {
        user: { userId: 'user-id', username: 'testuser' },
      };

      mockPurchasingService.createPurchase.mockRejectedValue(
        new BadRequestException('Invalid purchase data'),
      );

      await expect(
        controller.createPurchase(createPurchaseDto, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllPurchases', () => {
    it('should return all purchases', async () => {
      const mockPurchases = [
        {
          id: 'purchase-1',
          purchaseNumber: 'PO-2024-0001',
          supplierId: 'supplier-1',
          totalAmount: 100,
          purchaseStatus: PurchaseStatus.ORDERED,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPurchasingService.findAllPurchases.mockResolvedValue(mockPurchases);

      const result = await controller.findAllPurchases();

      expect(service.findAllPurchases).toHaveBeenCalled();
      expect(result).toEqual(mockPurchases);
    });
  });

  describe('findPurchaseById', () => {
    it('should return purchase by id', async () => {
      const mockPurchase = {
        id: 'purchase-id',
        purchaseNumber: 'PO-2024-0001',
        supplierId: 'supplier-id',
        totalAmount: 100,
        purchaseStatus: PurchaseStatus.PENDING,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPurchasingService.findPurchaseById.mockResolvedValue(mockPurchase);

      const result = await controller.findPurchaseById('purchase-id');

      expect(service.findPurchaseById).toHaveBeenCalledWith('purchase-id');
      expect(result).toEqual(mockPurchase);
    });

    it('should handle purchase not found', async () => {
      mockPurchasingService.findPurchaseById.mockRejectedValue(
        new NotFoundException('Purchase not found'),
      );

      await expect(controller.findPurchaseById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findPurchaseByNumber', () => {
    it('should return purchase by number', async () => {
      const mockPurchase = {
        id: 'purchase-id',
        purchaseNumber: 'PO-2024-0001',
        supplierId: 'supplier-id',
        totalAmount: 100,
        purchaseStatus: PurchaseStatus.PENDING,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPurchasingService.findPurchaseByNumber.mockResolvedValue(
        mockPurchase,
      );

      const result = await controller.findPurchaseByNumber('PO-2024-0001');

      expect(service.findPurchaseByNumber).toHaveBeenCalledWith('PO-2024-0001');
      expect(result).toEqual(mockPurchase);
    });
  });

  describe('findPurchasesBySupplier', () => {
    it('should return purchases for supplier', async () => {
      const mockPurchases = [
        {
          id: 'purchase-1',
          purchaseNumber: 'PO-2024-0001',
          supplierId: 'supplier-id',
          totalAmount: 100,
          purchaseStatus: PurchaseStatus.PENDING,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPurchasingService.findPurchasesBySupplier.mockResolvedValue(
        mockPurchases,
      );

      const result = await controller.findPurchasesBySupplier('supplier-id');

      expect(service.findPurchasesBySupplier).toHaveBeenCalledWith(
        'supplier-id',
      );
      expect(result).toEqual(mockPurchases);
    });
  });

  describe('findPurchasesByStatus', () => {
    it('should return purchases by status', async () => {
      const mockPurchases = [
        {
          id: 'purchase-1',
          purchaseNumber: 'PO-2024-0001',
          supplierId: 'supplier-id',
          totalAmount: 100,
          purchaseStatus: PurchaseStatus.PENDING,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPurchasingService.findPurchasesByStatus.mockResolvedValue(
        mockPurchases,
      );

      const result = await controller.findPurchasesByStatus(
        PurchaseStatus.PENDING,
      );

      expect(service.findPurchasesByStatus).toHaveBeenCalledWith(
        PurchaseStatus.PENDING,
      );
      expect(result).toEqual(mockPurchases);
    });
  });

  describe('updatePurchase', () => {
    const updatePurchaseDto = {
      taxRate: 15,
      shippingCost: 30,
      notes: 'Updated purchase',
    };

    it('should update purchase successfully', async () => {
      const mockPurchase = {
        id: 'purchase-id',
        purchaseNumber: 'PO-2024-0001',
        supplierId: 'supplier-id',
        totalAmount: 100,
        purchaseStatus: PurchaseStatus.DRAFT,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPurchasingService.updatePurchase.mockResolvedValue(mockPurchase);

      const result = await controller.updatePurchase(
        'purchase-id',
        updatePurchaseDto,
      );

      expect(service.updatePurchase).toHaveBeenCalledWith(
        'purchase-id',
        updatePurchaseDto,
      );
      expect(result).toEqual(mockPurchase);
    });
  });

  describe('deletePurchase', () => {
    it('should delete purchase successfully', async () => {
      mockPurchasingService.deletePurchase.mockResolvedValue(undefined);

      const result = await controller.deletePurchase('purchase-id');

      expect(service.deletePurchase).toHaveBeenCalledWith('purchase-id');
      expect(result).toEqual({ message: 'Purchase deleted successfully' });
    });
  });

  describe('receivePurchase', () => {
    it('should receive purchase successfully', async () => {
      const mockPurchase = {
        id: 'purchase-id',
        purchaseNumber: 'PO-2024-0001',
        supplierId: 'supplier-id',
        totalAmount: 100,
        purchaseStatus: PurchaseStatus.RECEIVED,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const receivedItems = [{ itemId: 'item-id', receivedQuantity: 2 }];

      mockPurchasingService.receivePurchase.mockResolvedValue(mockPurchase);

      const result = await controller.receivePurchase(
        'purchase-id',
        receivedItems,
      );

      expect(service.receivePurchase).toHaveBeenCalledWith(
        'purchase-id',
        receivedItems,
      );
      expect(result).toEqual(mockPurchase);
    });
  });

  describe('createSupplier', () => {
    const createSupplierDto: CreateSupplierDto = {
      name: 'Test Supplier',
      email: 'test@supplier.com',
      phone: '1234567890',
      address: 'Test Address',
      contactPerson: 'John Doe',
      taxId: 'TAX123',
      paymentTerms: 30,
    };

    it('should create supplier successfully', async () => {
      const mockSupplier = {
        id: 'supplier-id',
        name: 'Test Supplier',
        email: 'test@supplier.com',
        phone: '1234567890',
        address: 'Test Address',
        contactPerson: 'John Doe',
        taxId: 'TAX123',
        paymentTerms: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPurchasingService.createSupplier.mockResolvedValue(mockSupplier);

      const result = await controller.createSupplier(createSupplierDto);

      expect(service.createSupplier).toHaveBeenCalledWith(createSupplierDto);
      expect(result).toEqual(mockSupplier);
    });
  });

  describe('findAllSuppliers', () => {
    it('should return all suppliers', async () => {
      const mockSuppliers = [
        {
          id: 'supplier-1',
          name: 'Test Supplier 1',
          email: 'test1@supplier.com',
          phone: '1234567890',
          address: 'Test Address 1',
          contactPerson: 'John Doe',
          paymentTerms: 30,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPurchasingService.findAllSuppliers.mockResolvedValue(mockSuppliers);

      const result = await controller.findAllSuppliers();

      expect(service.findAllSuppliers).toHaveBeenCalled();
      expect(result).toEqual(mockSuppliers);
    });
  });

  describe('findSupplierById', () => {
    it('should return supplier by id', async () => {
      const mockSupplier = {
        id: 'supplier-id',
        name: 'Test Supplier',
        email: 'test@supplier.com',
        phone: '1234567890',
        address: 'Test Address',
        contactPerson: 'John Doe',
        paymentTerms: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPurchasingService.findSupplierById.mockResolvedValue(mockSupplier);

      const result = await controller.findSupplierById('supplier-id');

      expect(service.findSupplierById).toHaveBeenCalledWith('supplier-id');
      expect(result).toEqual(mockSupplier);
    });
  });

  describe('updateSupplier', () => {
    const updateSupplierDto = {
      name: 'Updated Supplier',
      email: 'updated@supplier.com',
    };

    it('should update supplier successfully', async () => {
      const mockSupplier = {
        id: 'supplier-id',
        name: 'Updated Supplier',
        email: 'updated@supplier.com',
        phone: '1234567890',
        address: 'Test Address',
        contactPerson: 'John Doe',
        paymentTerms: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPurchasingService.updateSupplier.mockResolvedValue(mockSupplier);

      const result = await controller.updateSupplier(
        'supplier-id',
        updateSupplierDto,
      );

      expect(service.updateSupplier).toHaveBeenCalledWith(
        'supplier-id',
        updateSupplierDto,
      );
      expect(result).toEqual(mockSupplier);
    });
  });

  describe('deleteSupplier', () => {
    it('should delete supplier successfully', async () => {
      mockPurchasingService.deleteSupplier.mockResolvedValue(undefined);

      const result = await controller.deleteSupplier('supplier-id');

      expect(service.deleteSupplier).toHaveBeenCalledWith('supplier-id');
      expect(result).toEqual({ message: 'Supplier deleted successfully' });
    });
  });

  describe('getPurchaseReport', () => {
    it('should return purchase report', async () => {
      const mockReport = {
        totalPurchases: 10,
        totalAmount: 1000,
        pendingPurchases: 3,
        receivedPurchases: 7,
        averagePurchaseValue: 100,
        topSuppliers: [],
        purchasesByPeriod: [],
      };

      mockPurchasingService.getPurchaseReport.mockResolvedValue(mockReport);

      const result = await controller.getPurchaseReport(
        '2024-01-01',
        '2024-12-31',
      );

      expect(service.getPurchaseReport).toHaveBeenCalledWith(
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );
      expect(result).toEqual(mockReport);
    });
  });

  describe('getOverduePurchases', () => {
    it('should return overdue purchases', async () => {
      const mockOverduePurchases = [
        {
          id: 'purchase-1',
          purchaseNumber: 'PO-2024-0001',
          supplierId: 'supplier-1',
          totalAmount: 100,
          purchaseStatus: PurchaseStatus.ORDERED,
          expectedDeliveryDate: new Date('2024-01-01'),
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPurchasingService.getOverduePurchases.mockResolvedValue(
        mockOverduePurchases,
      );

      const result = await controller.getOverduePurchases();

      expect(service.getOverduePurchases).toHaveBeenCalled();
      expect(result).toEqual(mockOverduePurchases);
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const mockPurchaseReport = {
        totalPurchases: 10,
        totalAmount: 1000,
        pendingPurchases: 3,
        receivedPurchases: 7,
        averagePurchaseValue: 100,
        topSuppliers: [],
        purchasesByPeriod: [],
      };

      const mockOverduePurchases = [
        {
          id: 'purchase-1',
          remainingAmount: 50,
        },
      ];

      mockPurchasingService.getPurchaseReport.mockResolvedValue(
        mockPurchaseReport,
      );
      mockPurchasingService.getOverduePurchases.mockResolvedValue(
        mockOverduePurchases,
      );

      const result = await controller.getDashboardStats();

      expect(service.getPurchaseReport).toHaveBeenCalled();
      expect(service.getOverduePurchases).toHaveBeenCalled();
      expect(result.purchaseReport).toEqual(mockPurchaseReport);
      expect(result.overduePurchases).toBe(1);
      expect(result.overdueAmount).toBe(50);
    });
  });

  describe('searchPurchases', () => {
    it('should return filtered purchases', async () => {
      const mockPurchases = [
        {
          id: 'purchase-1',
          purchaseNumber: 'PO-2024-0001',
          supplierId: 'supplier-id',
          totalAmount: 100,
          purchaseStatus: PurchaseStatus.PENDING,
          orderDate: new Date('2024-01-15'),
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPurchasingService.findAllPurchases.mockResolvedValue(mockPurchases);

      const result = await controller.searchPurchases(
        'supplier-id',
        PurchaseStatus.PENDING,
        '2024-01-01',
        '2024-01-31',
      );

      expect(service.findAllPurchases).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].supplierId).toBe('supplier-id');
    });
  });

  describe('getTopSuppliers', () => {
    it('should return top suppliers', async () => {
      const mockTopSuppliers = [
        {
          supplierId: 'supplier-1',
          supplierName: 'Supplier 1',
          purchases: 5,
          totalAmount: 500,
        },
      ];

      const mockPurchaseReport = {
        totalPurchases: 10,
        totalAmount: 1000,
        pendingPurchases: 3,
        receivedPurchases: 7,
        averagePurchaseValue: 100,
        topSuppliers: mockTopSuppliers,
        purchasesByPeriod: [],
      };

      mockPurchasingService.getPurchaseReport.mockResolvedValue(
        mockPurchaseReport,
      );

      const result = await controller.getTopSuppliers(5);

      expect(service.getPurchaseReport).toHaveBeenCalled();
      expect(result).toEqual(mockTopSuppliers);
    });
  });

  describe('getPurchaseTrend', () => {
    it('should return purchase trend', async () => {
      const mockPurchasesByPeriod = [
        {
          period: '2024-01',
          purchases: 5,
          amount: 500,
        },
      ];

      const mockPurchaseReport = {
        totalPurchases: 10,
        totalAmount: 1000,
        pendingPurchases: 3,
        receivedPurchases: 7,
        averagePurchaseValue: 100,
        topSuppliers: [],
        purchasesByPeriod: mockPurchasesByPeriod,
      };

      mockPurchasingService.getPurchaseReport.mockResolvedValue(
        mockPurchaseReport,
      );

      const result = await controller.getPurchaseTrend(12);

      expect(service.getPurchaseReport).toHaveBeenCalled();
      expect(result).toEqual(mockPurchasesByPeriod);
    });
  });

  describe('getSupplierPerformance', () => {
    it('should return supplier performance', async () => {
      const mockPurchases = [
        {
          id: 'purchase-1',
          supplierId: 'supplier-1',
          supplierName: 'Supplier 1',
          totalAmount: 100,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPurchasingService.findAllPurchases.mockResolvedValue(mockPurchases);

      const result = await controller.getSupplierPerformance();

      expect(service.findAllPurchases).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].supplierId).toBe('supplier-1');
      expect(result[0].totalAmount).toBe(100);
    });
  });

  describe('getNextPurchaseNumber', () => {
    it('should return next purchase number', async () => {
      const result = await controller.getNextPurchaseNumber();

      expect(result).toEqual({ purchaseNumber: 'PO-2024-0001' });
    });
  });

  describe('approvePurchase', () => {
    it('should approve purchase', async () => {
      const mockPurchase = {
        id: 'purchase-id',
        purchaseStatus: PurchaseStatus.APPROVED,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPurchasingService.updatePurchase.mockResolvedValue(mockPurchase);

      const result = await controller.approvePurchase('purchase-id');

      expect(service.updatePurchase).toHaveBeenCalledWith('purchase-id', {
        purchaseStatus: PurchaseStatus.APPROVED,
      });
      expect(result).toEqual(mockPurchase);
    });
  });

  describe('orderPurchase', () => {
    it('should order purchase', async () => {
      const mockPurchase = {
        id: 'purchase-id',
        purchaseStatus: PurchaseStatus.ORDERED,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPurchasingService.updatePurchase.mockResolvedValue(mockPurchase);

      const result = await controller.orderPurchase('purchase-id');

      expect(service.updatePurchase).toHaveBeenCalledWith('purchase-id', {
        purchaseStatus: PurchaseStatus.ORDERED,
      });
      expect(result).toEqual(mockPurchase);
    });
  });

  describe('cancelPurchase', () => {
    it('should cancel purchase', async () => {
      const mockPurchase = {
        id: 'purchase-id',
        purchaseStatus: PurchaseStatus.CANCELLED,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPurchasingService.updatePurchase.mockResolvedValue(mockPurchase);

      const result = await controller.cancelPurchase('purchase-id');

      expect(service.updatePurchase).toHaveBeenCalledWith('purchase-id', {
        purchaseStatus: PurchaseStatus.CANCELLED,
      });
      expect(result).toEqual(mockPurchase);
    });
  });

  describe('markPurchaseOverdue', () => {
    it('should mark purchase as overdue', async () => {
      const mockPurchase = {
        id: 'purchase-id',
        purchaseStatus: PurchaseStatus.ORDERED,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPurchasingService.updatePurchase.mockResolvedValue(mockPurchase);

      const result = await controller.markPurchaseOverdue('purchase-id');

      expect(service.updatePurchase).toHaveBeenCalledWith('purchase-id', {
        purchaseStatus: PurchaseStatus.ORDERED,
      });
      expect(result).toEqual(mockPurchase);
    });
  });
});
