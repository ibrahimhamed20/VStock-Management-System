import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dtos/report-filter.dto';
import { ExportFormatDto } from './dtos/export-format.dto';
import { Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/interfaces/auth-payload.interface';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('balance-sheet')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.MANAGER)
  getBalanceSheet(@Query() filter: ReportFilterDto) {
    return this.reportsService.getBalanceSheet(filter);
  }

  @Get('income-statement')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.MANAGER)
  getIncomeStatement(@Query() filter: ReportFilterDto) {
    return this.reportsService.getIncomeStatement(filter);
  }

  @Get('cash-flow')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.MANAGER)
  getCashFlow(@Query() filter: ReportFilterDto) {
    return this.reportsService.getCashFlowStatement(filter);
  }

  // Export endpoints
  @Get('balance-sheet/export')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.MANAGER)
  async exportBalanceSheet(
    @Query() filter: ReportFilterDto,
    @Query() formatDto: ExportFormatDto,
    @Res() res: Response,
  ) {
    const format = (formatDto.format || 'pdf') as 'pdf' | 'excel' | 'csv';
    await this.reportsService.exportBalanceSheet(filter, format, res);
  }

  @Get('income-statement/export')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.MANAGER)
  async exportIncomeStatement(
    @Query() filter: ReportFilterDto,
    @Query() formatDto: ExportFormatDto,
    @Res() res: Response,
  ) {
    const format = (formatDto.format || 'pdf') as 'pdf' | 'excel' | 'csv';
    await this.reportsService.exportIncomeStatement(filter, format, res);
  }

  @Get('cash-flow/export')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.MANAGER)
  async exportCashFlow(
    @Query() filter: ReportFilterDto,
    @Query() formatDto: ExportFormatDto,
    @Res() res: Response,
  ) {
    const format = (formatDto.format || 'pdf') as 'pdf' | 'excel' | 'csv';
    await this.reportsService.exportCashFlowStatement(filter, format, res);
  }
}
