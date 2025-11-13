import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { CreateJournalEntryDto } from './dtos/journal-entry.dto';
import { UpdateJournalEntryDto } from './dtos/update-journal-entry.dto';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('accounting')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // Chart of Accounts
  @Get('accounts')
  getAccountsTree() {
    return this.accountingService.getAccountsTree();
  }

  @Post('accounts')
  createAccount(@Body() body: any) {
    return this.accountingService.createAccount(body);
  }

  @Get('accounts/:id')
  getAccountById(@Param('id') id: string) {
    return this.accountingService.getAccountById(id);
  }

  @Put('accounts/:id')
  updateAccount(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.accountingService.updateAccount(id, dto);
  }

  @Delete('accounts/:id')
  deleteAccount(@Param('id') id: string) {
    return this.accountingService.deleteAccount(id);
  }

  // Journal Entries
  @Get('journal-entries')
  getJournalEntries(
    @Query('accountId') accountId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.getJournalEntries(accountId, startDate, endDate);
  }

  @Get('journal-entries/:id')
  getJournalEntryById(@Param('id') id: string) {
    return this.accountingService.getJournalEntryById(id);
  }

  @Post('journal-entries')
  createJournalEntry(@Body() dto: CreateJournalEntryDto) {
    return this.accountingService.createJournalEntry(dto);
  }

  @Put('journal-entries/:id')
  updateJournalEntry(@Param('id') id: string, @Body() dto: UpdateJournalEntryDto) {
    return this.accountingService.updateJournalEntry(id, dto);
  }

  @Delete('journal-entries/:id')
  deleteJournalEntry(@Param('id') id: string) {
    return this.accountingService.deleteJournalEntry(id);
  }

  // General Ledger
  @Get('general-ledger')
  getGeneralLedger(@Query('accountId') accountId?: string) {
    return this.accountingService.getGeneralLedger(accountId);
  }

  // Trial Balance
  @Get('trial-balance')
  getTrialBalance() {
    return this.accountingService.getTrialBalance();
  }

  // Financial Reports
  @Get('reports/balance-sheet')
  getBalanceSheet(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.accountingService.getBalanceSheet(startDate, endDate);
  }

  @Get('reports/income-statement')
  getIncomeStatement(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.accountingService.getIncomeStatement(startDate, endDate);
  }

  @Get('reports/cash-flow')
  getCashFlowStatement(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.accountingService.getCashFlowStatement(startDate, endDate);
  }

  // Account Reconciliation
  @Post('accounts/:id/reconcile')
  reconcileAccount(
    @Param('id') id: string,
    @Body() body: { statementBalance: number; statementDate: string },
  ) {
    return this.accountingService.reconcileAccount(id, body.statementBalance, body.statementDate);
  }
}
