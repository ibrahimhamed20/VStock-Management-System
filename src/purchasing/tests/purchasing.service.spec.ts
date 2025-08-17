import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchasingService } from '../purchasing.service';
import { Purchase } from '../entities/purchase.entity';
import { PurchaseItem } from '../entities/purchase-item.entity';
import { Supplier } from '../entities/supplier.entity';
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

describe('PurchasingService', () => {
  let service: PurchasingService;
  let purchaseRepository: Repository<Purchase>;
  let purchaseItemRepository: Repository<PurchaseItem>;
  let supplierRepository: Repository<Supplier>;

  const mockPurchaseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPurchaseItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockSupplierRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasingService,
        {
          provide: getRepositoryToken(Purchase),
          useValue: mockPurchaseRepository,
        },
        {
          provide: getRepositoryToken(PurchaseItem),
          useValue: mockPurchaseItemRepository,
        },
        {
          provide: getRepositoryToken(Supplier),
          useValue: mockSupplierRepository,
        },
      ],
    }).compile();

    service = module.get<PurchasingService>(PurchasingService);
    purchaseRepository = module.get<Repository<Purchase>>(
      getRepositoryToken(Purchase),
    );
    purchaseItemRepository = module.get<Repository<PurchaseItem>>(
      getRepositoryToken(PurchaseItem),
    );
    supplierRepository = module.get<Repository<Supplier>>(
      getRepositoryToken(Supplier),
    );
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

    it('should create a new purchase successfully', async () => {
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

      const mockPurchase = {
        id: 'purchase-id',
        purchaseNumber: 'PO-2024-0001',
        supplierId: 'supplier-id',
        subtotal: 100,
        taxRate: 10,
        taxAmount: 10,
        shippingCost: 20,
        totalAmount: 130,
        paidAmount: 0,
        remainingAmount: 130,
        purchaseStatus: PurchaseStatus.DRAFT,
        paymentStatus: PaymentStatus.PENDING,
        orderDate: new Date(),
        expectedDeliveryDate: new Date(),
        notes: 'Test purchase',
        createdBy: 'user-id',
        createdByName: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPurchaseItems = [
        {
          id: 'item-id',
          purchaseId: 'purchase-id',
          productId: 'product-id',
          productName: 'Test Product',
          productSku: 'TEST001',
          quantity: 2,
          unitCost: 50,
          totalCost: 100,
          receivedQuantity: 0,
          notes: 'Test item',
        },
      ];

      mockSupplierRepository.findOne.mockResolvedValue(mockSupplier);
      mockPurchaseRepository.create.mockReturnValue(mockPurchase);
      mockPurchaseRepository.save.mockResolvedValue(mockPurchase);
      mockPurchaseItemRepository.create.mockReturnValue(mockPurchaseItems[0]);
      mockPurchaseItemRepository.save.mockResolvedValue(mockPurchaseItems);

      const result = await service.createPurchase(
        createPurchaseDto,
        'user-id',
        'testuser',
      );

      expect(mockSupplierRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'supplier-id' },
      });
      expect(mockPurchaseRepository.create).toHaveBeenCalled();
      expect(mockPurchaseRepository.save).toHaveBeenCalledWith(mockPurchase);
      expect(mockPurchaseItemRepository.create).toHaveBeenCalled();
      expect(mockPurchaseItemRepository.save).toHaveBeenCalledWith(
        mockPurchaseItems,
      );
      expect(result.purchaseNumber).toBe('PO-2024-0001');
      expect(result.totalAmount).toBe(130);
    });

    it('should throw NotFoundException if supplier not found', async () => {
      mockSupplierRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createPurchase(createPurchaseDto, 'user-id', 'testuser'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if no items provided', async () => {
      const invalidDto = { ...createPurchaseDto, items: [] };

      await expect(
        service.createPurchase(invalidDto, 'user-id', 'testuser'),
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
          supplier: { name: 'Test Supplier' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPurchaseRepository.find.mockResolvedValue(mockPurchases);

      const result = await service.findAllPurchases();

      expect(mockPurchaseRepository.find).toHaveBeenCalledWith({
        relations: ['items', 'supplier'],
        order: { orderDate: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].purchaseNumber).toBe('PO-2024-0001');
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
        supplier: { name: 'Test Supplier' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPurchaseRepository.findOne.mockResolvedValue(mockPurchase);

      const result = await service.findPurchaseById('purchase-id');

      expect(mockPurchaseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'purchase-id' },
        relations: ['items', 'supplier'],
      });
      expect(result.id).toBe('purchase-id');
    });

    it('should throw NotFoundException if purchase not found', async () => {
      mockPurchaseRepository.findOne.mockResolvedValue(null);

      await expect(service.findPurchaseById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePurchase', () => {
    const updatePurchaseDto = {
      taxRate: 15,
      shippingCost: 30,
      notes: 'Updated purchase',
    };

    it('should update purchase successfully', async () => {
      const existingPurchase = {
        id: 'purchase-id',
        purchaseNumber: 'PO-2024-0001',
        supplierId: 'supplier-id',
        subtotal: 100,
        taxRate: 10,
        taxAmount: 10,
        shippingCost: 20,
        totalAmount: 130,
        paidAmount: 0,
        remainingAmount: 130,
        purchaseStatus: PurchaseStatus.DRAFT,
        items: [
          {
            id: 'item-id',
            productId: 'product-id',
            productName: 'Test Product',
            productSku: 'TEST001',
            quantity: 2,
            unitCost: 50,
            totalCost: 100,
            receivedQuantity: 0,
            notes: 'Test item',
          },
        ],
        supplier: { name: 'Test Supplier' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPurchase = { ...existingPurchase, ...updatePurchaseDto };

      mockPurchaseRepository.findOne.mockResolvedValue(existingPurchase);
      mockPurchaseRepository.save.mockResolvedValue(updatedPurchase);

      const result = await service.updatePurchase(
        'purchase-id',
        updatePurchaseDto,
      );

      expect(mockPurchaseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'purchase-id' },
        relations: ['items', 'supplier'],
      });
      expect(mockPurchaseRepository.save).toHaveBeenCalledWith(updatedPurchase);
      expect(result.taxRate).toBe(15);
    });

    it('should throw BadRequestException if purchase is received', async () => {
      const receivedPurchase = {
        id: 'purchase-id',
        purchaseStatus: PurchaseStatus.RECEIVED,
        items: [],
        supplier: { name: 'Test Supplier' },
      };

      mockPurchaseRepository.findOne.mockResolvedValue(receivedPurchase);

      await expect(
        service.updatePurchase('purchase-id', updatePurchaseDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deletePurchase', () => {
    it('should delete purchase successfully', async () => {
      const mockPurchase = {
        id: 'purchase-id',
        purchaseStatus: PurchaseStatus.DRAFT,
      };

      mockPurchaseRepository.findOne.mockResolvedValue(mockPurchase);
      mockPurchaseRepository.remove.mockResolvedValue(mockPurchase);

      await service.deletePurchase('purchase-id');

      expect(mockPurchaseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'purchase-id' },
      });
      expect(mockPurchaseRepository.remove).toHaveBeenCalledWith(mockPurchase);
    });

    it('should throw BadRequestException if purchase is received', async () => {
      const receivedPurchase = {
        id: 'purchase-id',
        purchaseStatus: PurchaseStatus.RECEIVED,
      };

      mockPurchaseRepository.findOne.mockResolvedValue(receivedPurchase);

      await expect(service.deletePurchase('purchase-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('receivePurchase', () => {
    it('should receive purchase successfully', async () => {
      const mockPurchase = {
        id: 'purchase-id',
        purchaseStatus: PurchaseStatus.ORDERED,
        items: [
          {
            id: 'item-id',
            productId: 'product-id',
            productName: 'Test Product',
            quantity: 2,
            unitCost: 50,
            totalCost: 100,
            receivedQuantity: 0,
          },
        ],
        supplier: { name: 'Test Supplier' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const receivedItems = [{ itemId: 'item-id', receivedQuantity: 2 }];

      mockPurchaseRepository.findOne.mockResolvedValue(mockPurchase);
      mockPurchaseItemRepository.save.mockResolvedValue(mockPurchase.items);
      mockPurchaseRepository.save.mockResolvedValue({
        ...mockPurchase,
        purchaseStatus: PurchaseStatus.RECEIVED,
        actualDeliveryDate: new Date(),
      });

      const result = await service.receivePurchase(
        'purchase-id',
        receivedItems,
      );

      expect(mockPurchaseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'purchase-id' },
        relations: ['items', 'supplier'],
      });
      expect(mockPurchaseItemRepository.save).toHaveBeenCalledWith(
        mockPurchase.items,
      );
      expect(result.purchaseStatus).toBe(PurchaseStatus.RECEIVED);
    });

    it('should throw BadRequestException if received quantity exceeds ordered quantity', async () => {
      const mockPurchase = {
        id: 'purchase-id',
        purchaseStatus: PurchaseStatus.ORDERED,
        items: [
          {
            id: 'item-id',
            productId: 'product-id',
            productName: 'Test Product',
            quantity: 2,
            unitCost: 50,
            totalCost: 100,
            receivedQuantity: 0,
          },
        ],
        supplier: { name: 'Test Supplier' },
      };

      const receivedItems = [{ itemId: 'item-id', receivedQuantity: 3 }];

      mockPurchaseRepository.findOne.mockResolvedValue(mockPurchase);

      await expect(
        service.receivePurchase('purchase-id', receivedItems),
      ).rejects.toThrow(BadRequestException);
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

      mockSupplierRepository.findOne.mockResolvedValue(null);
      mockSupplierRepository.create.mockReturnValue(mockSupplier);
      mockSupplierRepository.save.mockResolvedValue(mockSupplier);

      const result = await service.createSupplier(createSupplierDto);

      expect(mockSupplierRepository.findOne).toHaveBeenCalledWith({
        where: [{ name: 'Test Supplier' }, { email: 'test@supplier.com' }],
      });
      expect(mockSupplierRepository.create).toHaveBeenCalled();
      expect(mockSupplierRepository.save).toHaveBeenCalledWith(mockSupplier);
      expect(result.name).toBe('Test Supplier');
    });

    it('should throw ConflictException if supplier with same name or email exists', async () => {
      const existingSupplier = {
        id: 'existing-supplier-id',
        name: 'Test Supplier',
        email: 'test@supplier.com',
      };

      mockSupplierRepository.findOne.mockResolvedValue(existingSupplier);

      await expect(service.createSupplier(createSupplierDto)).rejects.toThrow(
        ConflictException,
      );
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

      mockSupplierRepository.find.mockResolvedValue(mockSuppliers);

      const result = await service.findAllSuppliers();

      expect(mockSupplierRepository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Supplier 1');
    });
  });

  describe('updateSupplier', () => {
    const updateSupplierDto = {
      name: 'Updated Supplier',
      email: 'updated@supplier.com',
    };

    it('should update supplier successfully', async () => {
      const existingSupplier = {
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

      const updatedSupplier = { ...existingSupplier, ...updateSupplierDto };

      mockSupplierRepository.findOne
        .mockResolvedValueOnce(existingSupplier) // First call for finding existing supplier
        .mockResolvedValueOnce(null); // Second call for checking conflicts
      mockSupplierRepository.save.mockResolvedValue(updatedSupplier);

      const result = await service.updateSupplier(
        'supplier-id',
        updateSupplierDto,
      );

      expect(mockSupplierRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'supplier-id' },
      });
      expect(mockSupplierRepository.save).toHaveBeenCalledWith(updatedSupplier);
      expect(result.name).toBe('Updated Supplier');
    });
  });

  describe('deleteSupplier', () => {
    it('should delete supplier successfully', async () => {
      const mockSupplier = {
        id: 'supplier-id',
        name: 'Test Supplier',
      };

      mockSupplierRepository.findOne.mockResolvedValue(mockSupplier);
      mockPurchaseRepository.count.mockResolvedValue(0);
      mockSupplierRepository.remove.mockResolvedValue(mockSupplier);

      await service.deleteSupplier('supplier-id');

      expect(mockSupplierRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'supplier-id' },
      });
      expect(mockPurchaseRepository.count).toHaveBeenCalledWith({
        where: { supplierId: 'supplier-id' },
      });
      expect(mockSupplierRepository.remove).toHaveBeenCalledWith(mockSupplier);
    });

    it('should throw BadRequestException if supplier has purchases', async () => {
      const mockSupplier = {
        id: 'supplier-id',
        name: 'Test Supplier',
      };

      mockSupplierRepository.findOne.mockResolvedValue(mockSupplier);
      mockPurchaseRepository.count.mockResolvedValue(5);

      await expect(service.deleteSupplier('supplier-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getPurchaseReport', () => {
    it('should return purchase report', async () => {
      const mockPurchases = [
        {
          id: 'purchase-1',
          totalAmount: 100,
          purchaseStatus: PurchaseStatus.ORDERED,
          orderDate: new Date(),
          supplier: { name: 'Test Supplier' },
          items: [],
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockPurchases),
      };

      mockPurchaseRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getPurchaseReport();

      expect(mockPurchaseRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result.totalPurchases).toBe(1);
      expect(result.totalAmount).toBe(100);
      expect(result.pendingPurchases).toBe(0);
      expect(result.receivedPurchases).toBe(0);
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
          supplier: { name: 'Test Supplier' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPurchaseRepository.find.mockResolvedValue(mockOverduePurchases);

      const result = await service.getOverduePurchases();

      expect(mockPurchaseRepository.find).toHaveBeenCalledWith({
        where: {
          purchaseStatus: PurchaseStatus.ORDERED,
          expectedDeliveryDate: expect.any(Object),
        },
        relations: ['items', 'supplier'],
        order: { expectedDeliveryDate: 'ASC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].purchaseStatus).toBe(PurchaseStatus.ORDERED);
    });
  });
});
