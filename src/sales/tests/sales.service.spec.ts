import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesService } from '../sales.service';
import { Invoice } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { Payment } from '../entities/payment.entity';
import { CreateInvoiceDto } from '../dtos/create-invoice.dto';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { PaymentStatus, PaymentMethod } from '../interfaces/invoice.interface';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('SalesService', () => {
  let service: SalesService;
  let invoiceRepository: Repository<Invoice>;
  let invoiceItemRepository: Repository<InvoiceItem>;
  let paymentRepository: Repository<Payment>;

  const mockInvoiceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockInvoiceItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoiceRepository,
        },
        {
          provide: getRepositoryToken(InvoiceItem),
          useValue: mockInvoiceItemRepository,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    invoiceRepository = module.get<Repository<Invoice>>(
      getRepositoryToken(Invoice),
    );
    invoiceItemRepository = module.get<Repository<InvoiceItem>>(
      getRepositoryToken(InvoiceItem),
    );
    paymentRepository = module.get<Repository<Payment>>(
      getRepositoryToken(Payment),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInvoice', () => {
    const createInvoiceDto: CreateInvoiceDto = {
      clientId: 'client-id',
      items: [
        {
          productId: 'product-id',
          quantity: 2,
          unitPrice: 100,
          discount: 10,
        },
      ],
      taxRate: 10,
      discountAmount: 20,
      notes: 'Test invoice',
    };

    it('should create a new invoice successfully', async () => {
      const mockInvoice = {
        id: 'invoice-id',
        invoiceNumber: 'INV-2024-0001',
        clientId: 'client-id',
        subtotal: 190,
        taxRate: 10,
        taxAmount: 19,
        discountAmount: 20,
        totalAmount: 189,
        paidAmount: 0,
        remainingAmount: 189,
        paymentStatus: PaymentStatus.PENDING,
        issueDate: new Date(),
        dueDate: new Date(),
        notes: 'Test invoice',
        createdBy: 'user-id',
        createdByName: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInvoiceItems = [
        {
          id: 'item-id',
          invoiceId: 'invoice-id',
          productId: 'product-id',
          productName: 'Test Product',
          productSku: 'TEST001',
          quantity: 2,
          unitPrice: 100,
          discount: 10,
          totalPrice: 190,
        },
      ];

      mockInvoiceRepository.create.mockReturnValue(mockInvoice);
      mockInvoiceRepository.save.mockResolvedValue(mockInvoice);
      mockInvoiceItemRepository.create.mockReturnValue(mockInvoiceItems[0]);
      mockInvoiceItemRepository.save.mockResolvedValue(mockInvoiceItems);

      const result = await service.createInvoice(
        createInvoiceDto,
        'user-id',
        'testuser',
      );

      expect(mockInvoiceRepository.create).toHaveBeenCalled();
      expect(mockInvoiceRepository.save).toHaveBeenCalledWith(mockInvoice);
      expect(mockInvoiceItemRepository.create).toHaveBeenCalled();
      expect(mockInvoiceItemRepository.save).toHaveBeenCalledWith(
        mockInvoiceItems,
      );
      expect(result.invoiceNumber).toBe('INV-2024-0001');
      expect(result.totalAmount).toBe(189);
    });

    it('should throw BadRequestException if no items provided', async () => {
      const invalidDto = { ...createInvoiceDto, items: [] };

      await expect(
        service.createInvoice(invalidDto, 'user-id', 'testuser'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllInvoices', () => {
    it('should return all invoices', async () => {
      const mockInvoices = [
        {
          id: 'invoice-1',
          invoiceNumber: 'INV-2024-0001',
          clientId: 'client-1',
          totalAmount: 100,
          paymentStatus: PaymentStatus.PAID,
          items: [],
          payments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockInvoiceRepository.find.mockResolvedValue(mockInvoices);

      const result = await service.findAllInvoices();

      expect(mockInvoiceRepository.find).toHaveBeenCalledWith({
        relations: ['items', 'payments'],
        order: { issueDate: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].invoiceNumber).toBe('INV-2024-0001');
    });
  });

  describe('findInvoiceById', () => {
    it('should return invoice by id', async () => {
      const mockInvoice = {
        id: 'invoice-id',
        invoiceNumber: 'INV-2024-0001',
        clientId: 'client-id',
        totalAmount: 100,
        paymentStatus: PaymentStatus.PENDING,
        items: [],
        payments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);

      const result = await service.findInvoiceById('invoice-id');

      expect(mockInvoiceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invoice-id' },
        relations: ['items', 'payments'],
      });
      expect(result.id).toBe('invoice-id');
    });

    it('should throw NotFoundException if invoice not found', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.findInvoiceById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findInvoiceByNumber', () => {
    it('should return invoice by number', async () => {
      const mockInvoice = {
        id: 'invoice-id',
        invoiceNumber: 'INV-2024-0001',
        clientId: 'client-id',
        totalAmount: 100,
        paymentStatus: PaymentStatus.PENDING,
        items: [],
        payments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);

      const result = await service.findInvoiceByNumber('INV-2024-0001');

      expect(mockInvoiceRepository.findOne).toHaveBeenCalledWith({
        where: { invoiceNumber: 'INV-2024-0001' },
        relations: ['items', 'payments'],
      });
      expect(result.invoiceNumber).toBe('INV-2024-0001');
    });
  });

  describe('updateInvoice', () => {
    const updateInvoiceDto = {
      taxRate: 15,
      discountAmount: 30,
      notes: 'Updated invoice',
    };

    it('should update invoice successfully', async () => {
      const existingInvoice = {
        id: 'invoice-id',
        invoiceNumber: 'INV-2024-0001',
        clientId: 'client-id',
        subtotal: 100,
        taxRate: 10,
        taxAmount: 10,
        discountAmount: 20,
        totalAmount: 90,
        paidAmount: 0,
        remainingAmount: 90,
        paymentStatus: PaymentStatus.PENDING,
        items: [
          {
            id: 'item-id',
            productId: 'product-id',
            productName: 'Test Product',
            productSku: 'TEST001',
            quantity: 1,
            unitPrice: 100,
            discount: 0,
            totalPrice: 100,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedInvoice = { ...existingInvoice, ...updateInvoiceDto };

      mockInvoiceRepository.findOne.mockResolvedValue(existingInvoice);
      mockInvoiceRepository.save.mockResolvedValue(updatedInvoice);

      const result = await service.updateInvoice(
        'invoice-id',
        updateInvoiceDto,
      );

      expect(mockInvoiceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invoice-id' },
        relations: ['items'],
      });
      expect(mockInvoiceRepository.save).toHaveBeenCalledWith(updatedInvoice);
      expect(result.taxRate).toBe(15);
    });

    it('should throw BadRequestException if invoice is paid', async () => {
      const paidInvoice = {
        id: 'invoice-id',
        paymentStatus: PaymentStatus.PAID,
        items: [],
      };

      mockInvoiceRepository.findOne.mockResolvedValue(paidInvoice);

      await expect(
        service.updateInvoice('invoice-id', updateInvoiceDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteInvoice', () => {
    it('should delete invoice successfully', async () => {
      const mockInvoice = {
        id: 'invoice-id',
        paymentStatus: PaymentStatus.PENDING,
      };

      mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);
      mockInvoiceRepository.remove.mockResolvedValue(mockInvoice);

      await service.deleteInvoice('invoice-id');

      expect(mockInvoiceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invoice-id' },
      });
      expect(mockInvoiceRepository.remove).toHaveBeenCalledWith(mockInvoice);
    });

    it('should throw BadRequestException if invoice is paid', async () => {
      const paidInvoice = {
        id: 'invoice-id',
        paymentStatus: PaymentStatus.PAID,
      };

      mockInvoiceRepository.findOne.mockResolvedValue(paidInvoice);

      await expect(service.deleteInvoice('invoice-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createPayment', () => {
    const createPaymentDto: CreatePaymentDto = {
      invoiceId: 'invoice-id',
      amount: 50,
      method: PaymentMethod.CASH,
      reference: 'PAY-001',
      notes: 'Partial payment',
    };

    it('should create payment successfully', async () => {
      const mockInvoice = {
        id: 'invoice-id',
        totalAmount: 100,
        paidAmount: 0,
        remainingAmount: 100,
        paymentStatus: PaymentStatus.PENDING,
      };

      const mockPayment = {
        id: 'payment-id',
        invoiceId: 'invoice-id',
        amount: 50,
        method: PaymentMethod.CASH,
        reference: 'PAY-001',
        notes: 'Partial payment',
        processedBy: 'user-id',
        processedByName: 'testuser',
        processedAt: new Date(),
        createdAt: new Date(),
      };

      mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);
      mockPaymentRepository.create.mockReturnValue(mockPayment);
      mockPaymentRepository.save.mockResolvedValue(mockPayment);
      mockInvoiceRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.createPayment(
        createPaymentDto,
        'user-id',
        'testuser',
      );

      expect(mockInvoiceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invoice-id' },
      });
      expect(mockPaymentRepository.create).toHaveBeenCalled();
      expect(mockPaymentRepository.save).toHaveBeenCalledWith(mockPayment);
      expect(result.amount).toBe(50);
    });

    it('should throw BadRequestException if payment amount exceeds remaining balance', async () => {
      const mockInvoice = {
        id: 'invoice-id',
        totalAmount: 100,
        paidAmount: 0,
        remainingAmount: 100,
        paymentStatus: PaymentStatus.PENDING,
      };

      const invalidPaymentDto = { ...createPaymentDto, amount: 150 };

      mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);

      await expect(
        service.createPayment(invalidPaymentDto, 'user-id', 'testuser'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPaymentsByInvoice', () => {
    it('should return payments for invoice', async () => {
      const mockPayments = [
        {
          id: 'payment-1',
          invoiceId: 'invoice-id',
          amount: 50,
          method: PaymentMethod.CASH,
          reference: 'PAY-001',
          notes: 'Partial payment',
          processedBy: 'user-id',
          processedByName: 'testuser',
          processedAt: new Date(),
          createdAt: new Date(),
        },
      ];

      mockPaymentRepository.find.mockResolvedValue(mockPayments);

      const result = await service.getPaymentsByInvoice('invoice-id');

      expect(mockPaymentRepository.find).toHaveBeenCalledWith({
        where: { invoiceId: 'invoice-id' },
        order: { processedAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(50);
    });
  });

  describe('getSalesReport', () => {
    it('should return sales report', async () => {
      const mockInvoices = [
        {
          id: 'invoice-1',
          totalAmount: 100,
          paymentStatus: PaymentStatus.PAID,
          issueDate: new Date(),
          items: [
            {
              productId: 'product-1',
              productName: 'Product 1',
              quantity: 2,
              totalPrice: 100,
            },
          ],
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockInvoices),
      };

      mockInvoiceRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getSalesReport();

      expect(mockInvoiceRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result.totalSales).toBe(100);
      expect(result.totalInvoices).toBe(1);
      expect(result.paidInvoices).toBe(1);
    });
  });

  describe('getOverdueInvoices', () => {
    it('should return overdue invoices', async () => {
      const mockOverdueInvoices = [
        {
          id: 'invoice-1',
          invoiceNumber: 'INV-2024-0001',
          clientId: 'client-1',
          totalAmount: 100,
          paymentStatus: PaymentStatus.PENDING,
          dueDate: new Date('2024-01-01'),
          items: [],
          payments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockInvoiceRepository.find.mockResolvedValue(mockOverdueInvoices);

      const result = await service.getOverdueInvoices();

      expect(mockInvoiceRepository.find).toHaveBeenCalledWith({
        where: {
          paymentStatus: PaymentStatus.PENDING,
          dueDate: expect.any(Object),
        },
        relations: ['items', 'payments'],
        order: { dueDate: 'ASC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].paymentStatus).toBe(PaymentStatus.PENDING);
    });
  });
});
