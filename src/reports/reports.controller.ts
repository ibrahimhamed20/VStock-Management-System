import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dtos/report-filter.dto';
import { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('balance-sheet')
  getBalanceSheet(@Query() filter: ReportFilterDto) {
    return this.reportsService.getBalanceSheet(filter);
  }

  @Get('income-statement')
  getIncomeStatement(@Query() filter: ReportFilterDto) {
    return this.reportsService.getIncomeStatement(filter);
  }

  @Get('cash-flow')
  getCashFlow(@Query() filter: ReportFilterDto) {
    return this.reportsService.getCashFlowStatement(filter);
  }

  // Export endpoints (stubs)
  @Get('balance-sheet/export')
  async exportBalanceSheet(
    @Query() filter: ReportFilterDto,
    @Res() res: Response,
  ) {
    // TODO: Implement PDF/Excel export logic
    res.status(501).send('Export not implemented yet.');
  }

  @Get('income-statement/export')
  async exportIncomeStatement(
    @Query() filter: ReportFilterDto,
    @Res() res: Response,
  ) {
    // TODO: Implement PDF/Excel export logic
    res.status(501).send('Export not implemented yet.');
  }

  @Get('cash-flow/export')
  async exportCashFlow(@Query() filter: ReportFilterDto, @Res() res: Response) {
    // TODO: Implement PDF/Excel export logic
    res.status(501).send('Export not implemented yet.');
  }
}
