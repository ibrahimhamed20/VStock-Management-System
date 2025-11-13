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
import { SalesService } from './sales.service';
import { CreateInvoiceDto } from './dtos/create-invoice.dto';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/interfaces/auth-payload.interface';
import {
  IInvoice,
  ICreateInvoice,
  IUpdateInvoice,
  IPayment,
  ICreatePayment,
  ISalesReport,
  PaymentStatus,
} from './interfaces/invoice.interface';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // Invoice Management Endpoints
  @Post('invoices')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.ACCOUNTANT)
  async createInvoice(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @Request() req,
  ): Promise<IInvoice> {
    return this.salesService.createInvoice(
      createInvoiceDto,
      req.user.userId,
      req.user.username,
    );
  }

  @Get('invoices')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async findAllInvoices(): Promise<IInvoice[]> {
    return this.salesService.findAllInvoices();
  }

  @Get('invoices/:id')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.ACCOUNTANT)
  async findInvoiceById(@Param('id') id: string): Promise<IInvoice> {
    return this.salesService.findInvoiceById(id);
  }

  @Get('invoices/number/:invoiceNumber')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.ACCOUNTANT)
  async findInvoiceByNumber(
    @Param('invoiceNumber') invoiceNumber: string,
  ): Promise<IInvoice> {
    return this.salesService.findInvoiceByNumber(invoiceNumber);
  }

  @Get('invoices/client/:clientId')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async findInvoicesByClient(
    @Param('clientId') clientId: string,
  ): Promise<IInvoice[]> {
    return this.salesService.findInvoicesByClient(clientId);
  }

  @Get('invoices/status/:status')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async findInvoicesByStatus(
    @Param('status') status: PaymentStatus,
  ): Promise<IInvoice[]> {
    return this.salesService.findInvoicesByStatus(status);
  }

  @Put('invoices/:id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async updateInvoice(
    @Param('id') id: string,
    @Body() updateInvoiceDto: IUpdateInvoice,
  ): Promise<IInvoice> {
    return this.salesService.updateInvoice(id, updateInvoiceDto);
  }

  @Delete('invoices/:id')
  @Roles(UserRole.ADMIN)
  async deleteInvoice(@Param('id') id: string): Promise<{ message: string }> {
    await this.salesService.deleteInvoice(id);
    return { message: 'Invoice deleted successfully' };
  }

  // Payment Management Endpoints
  @Post('payments')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.ACCOUNTANT)
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req,
  ): Promise<IPayment> {
    return this.salesService.createPayment(
      createPaymentDto,
      req.user.userId,
      req.user.username,
    );
  }

  @Get('payments/invoice/:invoiceId')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.ACCOUNTANT)
  async getPaymentsByInvoice(
    @Param('invoiceId') invoiceId: string,
  ): Promise<IPayment[]> {
    return this.salesService.getPaymentsByInvoice(invoiceId);
  }

  // Reports Endpoints
  @Get('reports/sales')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async getSalesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ISalesReport> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.salesService.getSalesReport(start, end);
  }

  @Get('reports/overdue')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async getOverdueInvoices(): Promise<IInvoice[]> {
    return this.salesService.getOverdueInvoices();
  }

  @Get('reports/dashboard')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async getDashboardStats(): Promise<any> {
    const [salesReport, overdueInvoices] = await Promise.all([
      this.salesService.getSalesReport(),
      this.salesService.getOverdueInvoices(),
    ]);

    // Calculate additional stats
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Calculate monthly sales (current month)
    const monthlySales = salesReport.salesByPeriod
      .filter(period => {
        const [year, month] = period.period.split('-').map(Number);
        return year === currentYear && month === currentMonth + 1;
      })
      .reduce((sum, period) => sum + period.sales, 0);

    // Calculate weekly sales (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklySales = salesReport.salesByPeriod
      .filter(period => {
        const [year, month] = period.period.split('-').map(Number);
        const periodDate = new Date(year, month - 1, 1);
        return periodDate >= weekAgo;
      })
      .reduce((sum, period) => sum + period.sales, 0);

    return {
      stats: {
        totalSales: salesReport.totalSales,
        totalInvoices: salesReport.totalInvoices,
        paidInvoices: salesReport.paidInvoices,
        pendingInvoices: salesReport.pendingInvoices,
        overdueInvoices: salesReport.overdueInvoices,
        overdueAmount: overdueInvoices.reduce(
          (sum, invoice) => sum + invoice.remainingAmount,
          0,
        ),
        averageInvoiceValue: salesReport.averageInvoiceValue,
        monthlySales,
        weeklySales,
      },
      recentInvoices: overdueInvoices.slice(0, 5), // Last 5 invoices
      topProducts: salesReport.topProducts,
      salesTrend: salesReport.salesByPeriod,
      paymentMethods: [], // TODO: Implement payment method stats
      overdueInvoices: overdueInvoices,
      clientPerformance: [], // TODO: Implement client performance stats
    };
  }

  // Search and Filter Endpoints
  @Get('search/invoices')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.ACCOUNTANT)
  async searchInvoices(
    @Query('clientId') clientId?: string,
    @Query('status') status?: PaymentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<IInvoice[]> {
    let invoices = await this.salesService.findAllInvoices();

    if (clientId) {
      invoices = invoices.filter((invoice) => invoice.clientId === clientId);
    }

    if (status) {
      invoices = invoices.filter((invoice) => invoice.paymentStatus === status);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      invoices = invoices.filter(
        (invoice) => invoice.issueDate >= start && invoice.issueDate <= end,
      );
    }

    return invoices;
  }

  @Get('analytics/top-products')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async getTopProducts(@Query('limit') limit: number = 10): Promise<any> {
    const salesReport = await this.salesService.getSalesReport();
    return salesReport.topProducts.slice(0, limit);
  }

  @Get('analytics/sales-trend')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async getSalesTrend(@Query('months') months: number = 12): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const salesReport = await this.salesService.getSalesReport(
      startDate,
      endDate,
    );
    return salesReport.salesByPeriod;
  }

  @Get('analytics/payment-methods')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async getPaymentMethodStats(): Promise<any> {
    const invoices = await this.salesService.findAllInvoices();
    const paymentStats = new Map<string, { count: number; amount: number }>();

    // This would need to be implemented in the service to get actual payment method stats
    // For now, returning a placeholder
    return {
      CASH: { count: 0, amount: 0 },
      CARD: { count: 0, amount: 0 },
      BANK_TRANSFER: { count: 0, amount: 0 },
      CHECK: { count: 0, amount: 0 },
      DIGITAL_WALLET: { count: 0, amount: 0 },
    };
  }

  @Get('analytics/client-performance')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async getClientPerformance(): Promise<any> {
    const invoices = await this.salesService.findAllInvoices();
    const clientStats = new Map<
      string,
      { name: string; invoices: number; total: number }
    >();

    invoices.forEach((invoice) => {
      const existing = clientStats.get(invoice.clientId) || {
        name: invoice.clientName,
        invoices: 0,
        total: 0,
      };
      existing.invoices += 1;
      existing.total += invoice.totalAmount;
      clientStats.set(invoice.clientId, existing);
    });

    return Array.from(clientStats.entries())
      .map(([clientId, stats]) => ({
        clientId,
        clientName: stats.name,
        invoices: stats.invoices,
        totalAmount: stats.total,
        averageAmount: stats.total / stats.invoices,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  }

  // Utility Endpoints
  @Get('next-invoice-number')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.ACCOUNTANT)
  async getNextInvoiceNumber(): Promise<{ invoiceNumber: string }> {
    return await this.salesService.getNextInvoiceNumber();
  }

  @Post('invoices/:id/cancel')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async cancelInvoice(@Param('id') id: string): Promise<IInvoice> {
    return this.salesService.updateInvoice(id, {
      paymentStatus: PaymentStatus.CANCELLED,
    });
  }

  @Post('invoices/:id/mark-overdue')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async markInvoiceOverdue(@Param('id') id: string): Promise<IInvoice> {
    return this.salesService.updateInvoice(id, {
      paymentStatus: PaymentStatus.OVERDUE,
    });
  }
}
