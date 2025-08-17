import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { CreateJournalEntryDto } from './dtos/journal-entry.dto';

@Controller('accounting')
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

  // Journal Entries
  @Get('journal-entries')
  getJournalEntries(@Query('accountId') accountId?: string) {
    return this.accountingService.getJournalEntries(accountId);
  }

  @Post('journal-entries')
  createJournalEntry(@Body() dto: CreateJournalEntryDto) {
    return this.accountingService.createJournalEntry(dto);
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
}
