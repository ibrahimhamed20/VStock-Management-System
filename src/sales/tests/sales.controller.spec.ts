import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from '../sales.controller';
import { SalesService } from '../sales.service';
import { CreateInvoiceDto } from '../dtos/create-invoice.dto';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { PaymentStatus, PaymentMethod } from '../interfaces/invoice.interface';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('SalesController', () => {
  let controller: SalesController;
  let service: SalesService;

  const mockSalesService = {
    createInvoice: jest.fn(),
    findAllInvoices: jest.fn(),
    findInvoiceById: jest.fn(),
    findInvoiceByNumber: jest.fn(),
    findInvoicesByClient: jest.fn(),
    findInvoicesByStatus: jest.fn(),
    updateInvoice: jest.fn(),
    deleteInvoice: jest.fn(),
    createPayment: jest.fn(),
    getPaymentsByInvoice: jest.fn(),
    getSalesReport: jest.fn(),
    getOverdueInvoices: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        {
          provide: SalesService,
          useValue: mockSalesService,
        },
      ],
    }).compile();

    controller = module.get<SalesController>(SalesController);
    service = module.get<SalesService>(SalesService);
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

    it('should create a new invoice', async () => {
      const mockInvoice = {
        id: 'invoice-id',
        invoiceNumber: 'INV-2024-0001',
        clientId: 'client-id',
        totalAmount: 189,
        paymentStatus: PaymentStatus.PENDING,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRequest = {
        user: { userId: 'user-id', username: 'testuser' },
      };

      mockSalesService.createInvoice.mockResolvedValue(mockInvoice);

      const result = await controller.createInvoice(
        createInvoiceDto,
        mockRequest,
      );

      expect(service.createInvoice).toHaveBeenCalledWith(
        createInvoiceDto,
        'user-id',
        'testuser',
      );
      expect(result).toEqual(mockInvoice);
    });

    it('should handle service errors', async () => {
      const mockRequest = {
        user: { userId: 'user-id', username: 'testuser' },
      };

      mockSalesService.createInvoice.mockRejectedValue(
        new BadRequestException('Invalid invoice data'),
      );

      await expect(
        controller.createInvoice(createInvoiceDto, mockRequest),
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockSalesService.findAllInvoices.mockResolvedValue(mockInvoices);

      const result = await controller.findAllInvoices();

      expect(service.findAllInvoices).toHaveBeenCalled();
      expect(result).toEqual(mockInvoices);
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSalesService.findInvoiceById.mockResolvedValue(mockInvoice);

      const result = await controller.findInvoiceById('invoice-id');

      expect(service.findInvoiceById).toHaveBeenCalledWith('invoice-id');
      expect(result).toEqual(mockInvoice);
    });

    it('should handle invoice not found', async () => {
      mockSalesService.findInvoiceById.mockRejectedValue(
        new NotFoundException('Invoice not found'),
      );

      await expect(controller.findInvoiceById('non-existent')).rejects.toThrow(
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSalesService.findInvoiceByNumber.mockResolvedValue(mockInvoice);

      const result = await controller.findInvoiceByNumber('INV-2024-0001');

      expect(service.findInvoiceByNumber).toHaveBeenCalledWith('INV-2024-0001');
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('findInvoicesByClient', () => {
    it('should return invoices for client', async () => {
      const mockInvoices = [
        {
          id: 'invoice-1',
          invoiceNumber: 'INV-2024-0001',
          clientId: 'client-id',
          totalAmount: 100,
          paymentStatus: PaymentStatus.PENDING,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockSalesService.findInvoicesByClient.mockResolvedValue(mockInvoices);

      const result = await controller.findInvoicesByClient('client-id');

      expect(service.findInvoicesByClient).toHaveBeenCalledWith('client-id');
      expect(result).toEqual(mockInvoices);
    });
  });

  describe('findInvoicesByStatus', () => {
    it('should return invoices by status', async () => {
      const mockInvoices = [
        {
          id: 'invoice-1',
          invoiceNumber: 'INV-2024-0001',
          clientId: 'client-id',
          totalAmount: 100,
          paymentStatus: PaymentStatus.PENDING,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockSalesService.findInvoicesByStatus.mockResolvedValue(mockInvoices);

      const result = await controller.findInvoicesByStatus(
        PaymentStatus.PENDING,
      );

      expect(service.findInvoicesByStatus).toHaveBeenCalledWith(
        PaymentStatus.PENDING,
      );
      expect(result).toEqual(mockInvoices);
    });
  });

  describe('updateInvoice', () => {
    const updateInvoiceDto = {
      taxRate: 15,
      discountAmount: 30,
      notes: 'Updated invoice',
    };

    it('should update invoice successfully', async () => {
      const mockInvoice = {
        id: 'invoice-id',
        invoiceNumber: 'INV-2024-0001',
        clientId: 'client-id',
        totalAmount: 100,
        paymentStatus: PaymentStatus.PENDING,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSalesService.updateInvoice.mockResolvedValue(mockInvoice);

      const result = await controller.updateInvoice(
        'invoice-id',
        updateInvoiceDto,
      );

      expect(service.updateInvoice).toHaveBeenCalledWith(
        'invoice-id',
        updateInvoiceDto,
      );
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('deleteInvoice', () => {
    it('should delete invoice successfully', async () => {
      mockSalesService.deleteInvoice.mockResolvedValue(undefined);

      const result = await controller.deleteInvoice('invoice-id');

      expect(service.deleteInvoice).toHaveBeenCalledWith('invoice-id');
      expect(result).toEqual({ message: 'Invoice deleted successfully' });
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
      const mockPayment = {
        id: 'payment-id',
        invoiceId: 'invoice-id',
        amount: 50,
        method: PaymentMethod.CASH,
        reference: 'PAY-001',
        notes: 'Partial payment',
        processedBy: 'user-id',
        processedAt: new Date(),
        createdAt: new Date(),
      };

      const mockRequest = {
        user: { userId: 'user-id', username: 'testuser' },
      };

      mockSalesService.createPayment.mockResolvedValue(mockPayment);

      const result = await controller.createPayment(
        createPaymentDto,
        mockRequest,
      );

      expect(service.createPayment).toHaveBeenCalledWith(
        createPaymentDto,
        'user-id',
        'testuser',
      );
      expect(result).toEqual(mockPayment);
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
          processedAt: new Date(),
          createdAt: new Date(),
        },
      ];

      mockSalesService.getPaymentsByInvoice.mockResolvedValue(mockPayments);

      const result = await controller.getPaymentsByInvoice('invoice-id');

      expect(service.getPaymentsByInvoice).toHaveBeenCalledWith('invoice-id');
      expect(result).toEqual(mockPayments);
    });
  });

  describe('getSalesReport', () => {
    it('should return sales report', async () => {
      const mockReport = {
        totalSales: 1000,
        totalInvoices: 10,
        paidInvoices: 8,
        pendingInvoices: 2,
        overdueInvoices: 0,
        averageInvoiceValue: 100,
        topProducts: [],
        salesByPeriod: [],
      };

      mockSalesService.getSalesReport.mockResolvedValue(mockReport);

      const result = await controller.getSalesReport(
        '2024-01-01',
        '2024-12-31',
      );

      expect(service.getSalesReport).toHaveBeenCalledWith(
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );
      expect(result).toEqual(mockReport);
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockSalesService.getOverdueInvoices.mockResolvedValue(
        mockOverdueInvoices,
      );

      const result = await controller.getOverdueInvoices();

      expect(service.getOverdueInvoices).toHaveBeenCalled();
      expect(result).toEqual(mockOverdueInvoices);
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const mockSalesReport = {
        totalSales: 1000,
        totalInvoices: 10,
        paidInvoices: 8,
        pendingInvoices: 2,
        overdueInvoices: 0,
        averageInvoiceValue: 100,
        topProducts: [],
        salesByPeriod: [],
      };

      const mockOverdueInvoices = [
        {
          id: 'invoice-1',
          remainingAmount: 50,
        },
      ];

      mockSalesService.getSalesReport.mockResolvedValue(mockSalesReport);
      mockSalesService.getOverdueInvoices.mockResolvedValue(
        mockOverdueInvoices,
      );

      const result = await controller.getDashboardStats();

      expect(service.getSalesReport).toHaveBeenCalled();
      expect(service.getOverdueInvoices).toHaveBeenCalled();
      expect(result.salesReport).toEqual(mockSalesReport);
      expect(result.overdueInvoices).toBe(1);
      expect(result.overdueAmount).toBe(50);
    });
  });

  describe('searchInvoices', () => {
    it('should return filtered invoices', async () => {
      const mockInvoices = [
        {
          id: 'invoice-1',
          invoiceNumber: 'INV-2024-0001',
          clientId: 'client-id',
          totalAmount: 100,
          paymentStatus: PaymentStatus.PENDING,
          issueDate: new Date('2024-01-15'),
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockSalesService.findAllInvoices.mockResolvedValue(mockInvoices);

      const result = await controller.searchInvoices(
        'client-id',
        PaymentStatus.PENDING,
        '2024-01-01',
        '2024-01-31',
      );

      expect(service.findAllInvoices).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].clientId).toBe('client-id');
    });
  });

  describe('getTopProducts', () => {
    it('should return top products', async () => {
      const mockTopProducts = [
        {
          productId: 'product-1',
          productName: 'Product 1',
          quantity: 10,
          revenue: 500,
        },
      ];

      const mockSalesReport = {
        totalSales: 1000,
        totalInvoices: 10,
        paidInvoices: 8,
        pendingInvoices: 2,
        overdueInvoices: 0,
        averageInvoiceValue: 100,
        topProducts: mockTopProducts,
        salesByPeriod: [],
      };

      mockSalesService.getSalesReport.mockResolvedValue(mockSalesReport);

      const result = await controller.getTopProducts(5);

      expect(service.getSalesReport).toHaveBeenCalled();
      expect(result).toEqual(mockTopProducts);
    });
  });

  describe('getSalesTrend', () => {
    it('should return sales trend', async () => {
      const mockSalesByPeriod = [
        {
          period: '2024-01',
          sales: 1000,
          invoices: 10,
        },
      ];

      const mockSalesReport = {
        totalSales: 1000,
        totalInvoices: 10,
        paidInvoices: 8,
        pendingInvoices: 2,
        overdueInvoices: 0,
        averageInvoiceValue: 100,
        topProducts: [],
        salesByPeriod: mockSalesByPeriod,
      };

      mockSalesService.getSalesReport.mockResolvedValue(mockSalesReport);

      const result = await controller.getSalesTrend(12);

      expect(service.getSalesReport).toHaveBeenCalled();
      expect(result).toEqual(mockSalesByPeriod);
    });
  });

  describe('getPaymentMethodStats', () => {
    it('should return payment method statistics', async () => {
      const result = await controller.getPaymentMethodStats();

      expect(result).toEqual({
        CASH: { count: 0, amount: 0 },
        CARD: { count: 0, amount: 0 },
        BANK_TRANSFER: { count: 0, amount: 0 },
        CHECK: { count: 0, amount: 0 },
        DIGITAL_WALLET: { count: 0, amount: 0 },
      });
    });
  });

  describe('getClientPerformance', () => {
    it('should return client performance', async () => {
      const mockInvoices = [
        {
          id: 'invoice-1',
          clientId: 'client-1',
          clientName: 'Client 1',
          totalAmount: 100,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockSalesService.findAllInvoices.mockResolvedValue(mockInvoices);

      const result = await controller.getClientPerformance();

      expect(service.findAllInvoices).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].clientId).toBe('client-1');
      expect(result[0].totalAmount).toBe(100);
    });
  });

  describe('getNextInvoiceNumber', () => {
    it('should return next invoice number', async () => {
      const result = await controller.getNextInvoiceNumber();

      expect(result).toEqual({ invoiceNumber: 'INV-2024-0001' });
    });
  });

  describe('cancelInvoice', () => {
    it('should cancel invoice', async () => {
      const mockInvoice = {
        id: 'invoice-id',
        paymentStatus: PaymentStatus.CANCELLED,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSalesService.updateInvoice.mockResolvedValue(mockInvoice);

      const result = await controller.cancelInvoice('invoice-id');

      expect(service.updateInvoice).toHaveBeenCalledWith('invoice-id', {
        paymentStatus: PaymentStatus.CANCELLED,
      });
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('markInvoiceOverdue', () => {
    it('should mark invoice as overdue', async () => {
      const mockInvoice = {
        id: 'invoice-id',
        paymentStatus: PaymentStatus.OVERDUE,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSalesService.updateInvoice.mockResolvedValue(mockInvoice);

      const result = await controller.markInvoiceOverdue('invoice-id');

      expect(service.updateInvoice).toHaveBeenCalledWith('invoice-id', {
        paymentStatus: PaymentStatus.OVERDUE,
      });
      expect(result).toEqual(mockInvoice);
    });
  });
});
