import { Injectable } from '@nestjs/common';
import { AccountingService } from '../accounting/accounting.service';
import { ReportFilterDto } from './dtos/report-filter.dto';
import { AccountType } from '../accounting/entities/account.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly accountingService: AccountingService,
    private readonly settingsService: SettingsService,
  ) { }

  async resolveDateRange(filter: ReportFilterDto) {
    let { startDate, endDate, fiscalYear } = filter;
    if (fiscalYear) {
      // Use settingsService to get fiscal year start/end
      const settings = await this.settingsService.getSettings();
      // Assume fiscalYear is a string like '2024' and settings.fiscalYear is also '2024'
      // For real apps, store fiscal year start/end dates in settings
      // Here, just use Jan 1 - Dec 31 of the fiscalYear
      startDate = `${fiscalYear}-01-01`;
      endDate = `${fiscalYear}-12-31`;
    }
    return { startDate, endDate };
  }

  async getBalanceSheet(filter: ReportFilterDto) {
    // For now, ignore date filtering (would require historical balance logic)
    const trialBalance = await this.accountingService.getTrialBalance();
    const summary = trialBalance.summary;
    const assets = summary.filter((a) => a.type === AccountType.ASSET);
    const liabilities = summary.filter((a) => a.type === AccountType.LIABILITY);
    const equity = summary.filter((a) => a.type === AccountType.EQUITY);
    const totalAssets = assets.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalLiabilities = liabilities.reduce(
      (sum, a) => sum + Number(a.balance),
      0,
    );
    const totalEquity = equity.reduce((sum, a) => sum + Number(a.balance), 0);
    return {
      asOf: filter.endDate || new Date().toISOString(),
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilities,
      totalEquity,
    };
  }

  async getIncomeStatement(filter: ReportFilterDto) {
    const { startDate, endDate } = await this.resolveDateRange(filter);
    const entries = await this.accountingService.getJournalEntriesByDateRange(
      startDate,
      endDate,
    );
    const revenueMap = new Map();
    const expenseMap = new Map();
    for (const entry of entries) {
      for (const line of entry.lines) {
        let accountType;
        const account = await this.accountingService['accountRepo'].findOne({
          where: { id: line.account.id },
        });
        if (!account) continue;
        accountType = account.type;
        if (accountType === AccountType.REVENUE) {
          const prev = revenueMap.get(line.account.id) || 0;
          revenueMap.set(
            line.account.id,
            prev +
            (line.type === 'credit'
              ? Number(line.amount)
              : -Number(line.amount)),
          );
        } else if (accountType === AccountType.EXPENSE) {
          const prev = expenseMap.get(line.account.id) || 0;
          expenseMap.set(
            line.account.id,
            prev +
            (line.type === 'debit'
              ? Number(line.amount)
              : -Number(line.amount)),
          );
        }
      }
    }
    const revenue = Array.from(revenueMap.entries()).map(
      ([accountId, amount]) => ({ accountId, amount }),
    );
    const expenses = Array.from(expenseMap.entries()).map(
      ([accountId, amount]) => ({ accountId, amount }),
    );
    const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    return {
      from: startDate,
      to: endDate || new Date().toISOString(),
      revenue,
      expenses,
      totalRevenue,
      totalExpenses,
      netIncome,
    };
  }

  async getCashFlowStatement(filter: ReportFilterDto) {
    const { startDate, endDate } = await this.resolveDateRange(filter);
    // For simplicity, treat all lines affecting cash/bank accounts as cash flows
    // In a real app, classify accounts as cash/bank and group by activity
    // Here, just sum all debits/credits for accounts with code/name containing 'cash' or 'bank'
    const entries = await this.accountingService.getJournalEntriesByDateRange(
      startDate,
      endDate,
    );
    const cashFlows: any[] = [];
    for (const entry of entries) {
      for (const line of entry.lines) {
        // Fetch account
        const account = await this.accountingService['accountRepo'].findOne({
          where: { id: line.account.id },
        });
        if (!account) continue;
        const isCash =
          /cash|bank/i.test(account.name) || /cash|bank/i.test(account.code);
        if (isCash) {
          cashFlows.push({
            date: entry.date,
            accountId: line.account.id,
            accountName: account.name,
            type: line.type,
            amount: Number(line.amount),
            description: entry.description,
          });
        }
      }
    }
    // Aggregate inflows and outflows
    const inflows = cashFlows
      .filter((f) => f.type === 'debit')
      .reduce((sum, f) => sum + f.amount, 0);
    const outflows = cashFlows
      .filter((f) => f.type === 'credit')
      .reduce((sum, f) => sum + f.amount, 0);
    const netCashFlow = inflows - outflows;
    return {
      from: startDate,
      to: endDate || new Date().toISOString(),
      inflows,
      outflows,
      netCashFlow,
      details: cashFlows,
    };
  }

  // Export stubs (to be implemented)
  // async exportBalanceSheet(...) { ... }
  // async exportIncomeStatement(...) { ... }
  // async exportCashFlowStatement(...) { ... }
}
