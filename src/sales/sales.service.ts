import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Like } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Payment } from './entities/payment.entity';
import { CreateInvoiceDto } from './dtos/create-invoice.dto';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import {
  IInvoice,
  ICreateInvoice,
  IUpdateInvoice,
  IPayment,
  ICreatePayment,
  ISalesReport,
  PaymentStatus,
  PaymentMethod,
} from './interfaces/invoice.interface';
import { AccountingService } from '../accounting/accounting.service';
import { SettingsService } from 'src/settings/settings.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly settingsService: SettingsService,
    @Inject(forwardRef(() => AccountingService))
    private readonly accountingService?: AccountingService,
  ) { }

  async createInvoice(
    createInvoiceDto: CreateInvoiceDto,
    userId: string,
    userName: string,
  ): Promise<IInvoice> {
    const {
      clientId,
      items,
      taxRate = 0,
      discountAmount = 0,
      dueDate,
      notes,
    } = createInvoiceDto;

    // Validate items
    if (!items || items.length === 0) {
      throw new BadRequestException('Invoice must have at least one item');
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discount || 0;
      return sum + itemTotal - itemDiscount;
    }, 0);

    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount - discountAmount;

    // Calculate due date
    const calculatedDueDate = dueDate ? new Date(dueDate) : await this.calculateDefaultDueDate();

    // Create invoice
    const invoice = this.invoiceRepository.create({
      invoiceNumber,
      clientId,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      paymentStatus: PaymentStatus.PENDING,
      issueDate: new Date(),
      dueDate: calculatedDueDate,
      notes,
      createdBy: userId,
      createdByName: userName,
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Create invoice items
    const invoiceItems = items.map((item) =>
      this.invoiceItemRepository.create({
        invoiceId: savedInvoice.id,
        productId: item.productId,
        productName: item.productName || 'Unknown Product',
        productSku: item.productSku || 'N/A',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        totalPrice: item.quantity * item.unitPrice - (item.discount || 0),
      }),
    );

    await this.invoiceItemRepository.save(invoiceItems);

    return this.mapInvoiceToInterface(savedInvoice, invoiceItems);
  }

  async findAllInvoices(): Promise<IInvoice[]> {
    const invoices = await this.invoiceRepository.find({
      relations: ['items', 'payments', 'client'],
      order: { issueDate: 'DESC' },
    });

    return invoices.map((invoice) =>
      this.mapInvoiceToInterface(invoice, invoice.items),
    );
  }

  async findInvoiceById(id: string): Promise<IInvoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['items', 'payments', 'client'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return this.mapInvoiceToInterface(invoice, invoice.items);
  }

  async findInvoiceByNumber(invoiceNumber: string): Promise<IInvoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { invoiceNumber },
      relations: ['items', 'payments', 'client'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return this.mapInvoiceToInterface(invoice, invoice.items);
  }

  async findInvoicesByClient(clientId: string): Promise<IInvoice[]> {
    const invoices = await this.invoiceRepository.find({
      where: { clientId },
      relations: ['items', 'payments', 'client'],
      order: { issueDate: 'DESC' },
    });

    return invoices.map((invoice) =>
      this.mapInvoiceToInterface(invoice, invoice.items),
    );
  }

  async findInvoicesByStatus(status: PaymentStatus): Promise<IInvoice[]> {
    const invoices = await this.invoiceRepository.find({
      where: { paymentStatus: status },
      relations: ['items', 'payments', 'client'],
      order: { issueDate: 'DESC' },
    });

    return invoices.map((invoice) =>
      this.mapInvoiceToInterface(invoice, invoice.items),
    );
  }

  async updateInvoice(
    id: string,
    updateInvoiceDto: IUpdateInvoice,
  ): Promise<IInvoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check if invoice can be updated
    if (invoice.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Cannot update a paid invoice');
    }

    // Update invoice fields
    if (updateInvoiceDto.taxRate !== undefined) {
      invoice.taxRate = updateInvoiceDto.taxRate;
    }
    if (updateInvoiceDto.discountAmount !== undefined) {
      invoice.discountAmount = updateInvoiceDto.discountAmount;
    }
    if (updateInvoiceDto.dueDate !== undefined) {
      invoice.dueDate = new Date(updateInvoiceDto.dueDate);
    }
    if (updateInvoiceDto.notes !== undefined) {
      invoice.notes = updateInvoiceDto.notes;
    }
    if (updateInvoiceDto.paymentStatus !== undefined) {
      invoice.paymentStatus = updateInvoiceDto.paymentStatus;
    }

    // Update items if provided
    if (updateInvoiceDto.items) {
      // Remove existing items
      await this.invoiceItemRepository.delete({ invoiceId: id });

      // Create new items
      const invoiceItems = updateInvoiceDto.items.map((item) =>
        this.invoiceItemRepository.create({
          invoiceId: id,
          productId: item.productId,
          productName: item.productName || 'Unknown Product',
          productSku: item.productSku || 'N/A',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          totalPrice: item.quantity * item.unitPrice - (item.discount || 0),
        }),
      );

      await this.invoiceItemRepository.save(invoiceItems);
      invoice.items = invoiceItems;
    }

    // Recalculate totals
    const subtotal = invoice.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );
    const taxAmount = (subtotal * invoice.taxRate) / 100;
    const totalAmount = subtotal + taxAmount - invoice.discountAmount;

    invoice.subtotal = subtotal;
    invoice.taxAmount = taxAmount;
    invoice.totalAmount = totalAmount;
    invoice.remainingAmount = totalAmount - invoice.paidAmount;

    const updatedInvoice = await this.invoiceRepository.save(invoice);

    return this.mapInvoiceToInterface(updatedInvoice, updatedInvoice.items);
  }

  async deleteInvoice(id: string): Promise<void> {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid invoice');
    }

    await this.invoiceRepository.remove(invoice);
  }

  async createPayment(
    createPaymentDto: CreatePaymentDto,
    userId: string,
    userName: string,
  ): Promise<IPayment> {
    const { invoiceId, amount, method, reference, notes } = createPaymentDto;

    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Invoice is already fully paid');
    }

    if (amount > invoice.remainingAmount) {
      throw new BadRequestException('Payment amount exceeds remaining balance');
    }

    // Create payment
    const payment = this.paymentRepository.create({
      invoiceId,
      amount,
      method,
      reference,
      notes,
      processedBy: userId,
      processedByName: userName,
      processedAt: new Date(),
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Update invoice payment status
    const newPaidAmount = invoice.paidAmount + amount;
    const newRemainingAmount = invoice.totalAmount - newPaidAmount;

    let newPaymentStatus: PaymentStatus;
    if (newRemainingAmount === 0) {
      newPaymentStatus = PaymentStatus.PAID;
    } else if (newPaidAmount > 0) {
      newPaymentStatus = PaymentStatus.PARTIAL;
    } else {
      newPaymentStatus = PaymentStatus.PENDING;
    }

    // Check if overdue
    if (
      newPaymentStatus !== PaymentStatus.PAID &&
      new Date() > invoice.dueDate
    ) {
      newPaymentStatus = PaymentStatus.OVERDUE;
    }

    await this.invoiceRepository.update(invoiceId, {
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      paymentStatus: newPaymentStatus,
    });

    // Create journal entry for payment (if accounting service is available)
    try {
      await this.createPaymentJournalEntry(savedPayment, invoice);
    } catch (error) {
      // Log error but don't fail payment creation
      console.error('Failed to create journal entry for payment:', error);
    }

    return this.mapPaymentToInterface(savedPayment);
  }

  private async createPaymentJournalEntry(payment: Payment, invoice: Invoice) {
    if (!this.accountingService) return; // Accounting service not available

    try {
      // Find or get default accounts
      const accounts = await this.accountingService.getAccountsTree();
      const flattenAccounts = (accs: any[]): any[] => {
        const result: any[] = [];
        accs.forEach(acc => {
          result.push(acc);
          if (acc.children) {
            result.push(...flattenAccounts(acc.children));
          }
        });
        return result;
      };

      const allAccounts = flattenAccounts(accounts);
      
      // Find cash account (default: account with code containing 'cash' or type ASSET)
      let cashAccount = allAccounts.find((a: any) => 
        a.code.toLowerCase().includes('cash') || 
        (a.type === 'asset' && a.name.toLowerCase().includes('cash'))
      );
      
      // Find accounts receivable account
      let arAccount = allAccounts.find((a: any) => 
        a.code.toLowerCase().includes('receivable') || 
        a.name.toLowerCase().includes('receivable') ||
        (a.type === 'asset' && (a.code.toLowerCase().includes('ar') || a.name.toLowerCase().includes('ar')))
      );

      // If accounts don't exist, skip journal entry creation
      if (!cashAccount || !arAccount) {
        console.warn('Cash or Accounts Receivable account not found. Skipping journal entry creation.');
        return;
      }

      // Create journal entry: Debit Cash, Credit Accounts Receivable
      const paymentDate = payment.processedAt.toISOString().split('T')[0];
      await this.accountingService.createJournalEntry({
        date: paymentDate,
        reference: `PAY-${payment.code || payment.id.substring(0, 8)}`,
        description: `Payment received for Invoice ${invoice.invoiceNumber} - ${payment.method}`,
        lines: [
          {
            accountId: cashAccount.id,
            type: 'debit',
            amount: Number(payment.amount),
            description: `Payment from invoice ${invoice.invoiceNumber}`,
          },
          {
            accountId: arAccount.id,
            type: 'credit',
            amount: Number(payment.amount),
            description: `Payment received for invoice ${invoice.invoiceNumber}`,
          },
        ],
      });
    } catch (error) {
      console.error('Error creating payment journal entry:', error);
      // Don't throw - payment was already created
    }
  }

  async getPaymentsByInvoice(invoiceId: string): Promise<IPayment[]> {
    const payments = await this.paymentRepository.find({
      where: { invoiceId },
      order: { processedAt: 'DESC' },
    });

    return payments.map((payment) => this.mapPaymentToInterface(payment));
  }

  async getSalesReport(
    startDate?: Date,
    endDate?: Date,
  ): Promise<ISalesReport> {
    const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice');

    if (startDate && endDate) {
      queryBuilder.where('invoice.issueDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const invoices = await queryBuilder
      .leftJoinAndSelect('invoice.items', 'items')
      .getMany();

    const totalSales = invoices.reduce(
      (sum, invoice) => sum + Number(invoice.totalAmount),
      0,
    );
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(
      (i) => i.paymentStatus === PaymentStatus.PAID,
    ).length;
    const pendingInvoices = invoices.filter(
      (i) => i.paymentStatus === PaymentStatus.PENDING,
    ).length;
    const overdueInvoices = invoices.filter(
      (i) => i.paymentStatus === PaymentStatus.OVERDUE,
    ).length;

    // Calculate top products
    const productStats = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const key = item.productId;
        const existing = productStats.get(key) || {
          name: item.productName,
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quantity;
        existing.revenue += Number(item.totalPrice);
        productStats.set(key, existing);
      });
    });

    const topProducts = Array.from(productStats.entries())
      .map(([productId, stats]) => ({
        productId,
        productName: stats.name,
        quantity: stats.quantity,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate sales by period (monthly)
    const salesByPeriod = this.calculateSalesByPeriod(invoices);

    return {
      totalSales,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      averageInvoiceValue: totalInvoices > 0 ? totalSales / totalInvoices : 0,
      topProducts,
      salesByPeriod,
    };
  }

  async getOverdueInvoices(): Promise<IInvoice[]> {
    const overdueInvoices = await this.invoiceRepository.find({
      where: {
        paymentStatus: PaymentStatus.PENDING,
        dueDate: LessThanOrEqual(new Date()),
      },
      relations: ['items', 'payments', 'client'],
      order: { dueDate: 'ASC' },
    });

    return overdueInvoices.map((invoice) =>
      this.mapInvoiceToInterface(invoice, invoice.items),
    );
  }

  private async generateInvoiceNumber(): Promise<string> {
    const settings = await this.settingsService?.getSettings();
    const invoicePrefix = settings?.invoicePrefix || 'INV';
    const year = new Date().getFullYear();
    const prefix = `${invoicePrefix}-${year}`;

    const lastInvoice = await this.invoiceRepository.findOne({
      where: { invoiceNumber: Like(`${prefix}%`) },
      order: { invoiceNumber: 'DESC' },
    });

    let sequence = 1;
    if (lastInvoice) {
      const parts = lastInvoice.invoiceNumber.split('-');
      const lastSequence = parts.length > 2 ? parseInt(parts[parts.length - 1]) : 1;
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  async getNextInvoiceNumber(): Promise<{ invoiceNumber: string }> {
    const invoiceNumber = await this.generateInvoiceNumber();
    return { invoiceNumber };
  }

  private async calculateDefaultDueDate(): Promise<Date> {
    const settings = await this.settingsService?.getSettings();
    const paymentTerms = settings?.defaultPaymentTerms || 30;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + paymentTerms);
    return dueDate;
  }

  private calculateSalesByPeriod(invoices: Invoice[]): Array<{
    period: string;
    sales: number;
    invoices: number;
  }> {
    const periodStats = new Map<string, { sales: number; invoices: number }>();

    invoices.forEach((invoice) => {
      const period = invoice.createdAt ? `${invoice.createdAt?.getFullYear()}-${(
        invoice.createdAt?.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}` : '';

      const existing = periodStats.get(period) || { sales: 0, invoices: 0 };
      existing.sales += Number(invoice.totalAmount);
      existing.invoices += 1;
      periodStats.set(period, existing);
    });

    return Array.from(periodStats.entries())
      .map(([period, stats]) => ({
        period,
        sales: stats.sales,
        invoices: stats.invoices,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private mapInvoiceToInterface(
    invoice: Invoice,
    items: InvoiceItem[],
  ): IInvoice {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId,
      clientName: invoice.client?.name || 'Unknown Client',
      clientEmail: invoice.client?.email || '',
      clientPhone: invoice.client?.phone || '',
      clientAddress: invoice.client?.tags?.join(', ') || '',
      paymentTerms: 'Net 30',
      items: items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        discount: Number(item.discount),
      })),
      subtotal: Number(invoice.subtotal),
      taxAmount: Number(invoice.taxAmount),
      discountAmount: Number(invoice.discountAmount),
      totalAmount: Number(invoice.totalAmount),
      paidAmount: Number(invoice.paidAmount),
      remainingAmount: Number(invoice.remainingAmount),
      paymentStatus: invoice.paymentStatus,
      dueDate: invoice.dueDate,
      issueDate: invoice.issueDate,
      notes: invoice.notes,
      createdBy: invoice.createdBy,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }

  private mapPaymentToInterface(payment: Payment): IPayment {
    return {
      id: payment.id,
      invoiceId: payment.invoiceId,
      amount: Number(payment.amount),
      method: payment.method,
      reference: payment.reference,
      notes: payment.notes,
      processedBy: payment.processedBy,
      processedAt: payment.processedAt,
      createdAt: payment.createdAt,
    };
  }
}
