export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  fiscalYear?: string;
}

export interface BalanceSheetReport {
  asOf: string;
  assets: Array<{
    code: string;
    name: string;
    type: string;
    balance: number;
  }>;
  liabilities: Array<{
    code: string;
    name: string;
    type: string;
    balance: number;
  }>;
  equity: Array<{
    code: string;
    name: string;
    type: string;
    balance: number;
  }>;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export interface IncomeStatementReport {
  from: string;
  to: string;
  revenue: Array<{
    accountId: string;
    amount: number;
  }>;
  expenses: Array<{
    accountId: string;
    amount: number;
  }>;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export interface CashFlowReport {
  from: string;
  to: string;
  inflows: number;
  outflows: number;
  netCashFlow: number;
  details: Array<{
    date: string;
    accountId: string;
    accountName: string;
    type: string;
    amount: number;
    description: string;
  }>;
}

export type ReportType = 'balance-sheet' | 'income-statement' | 'cash-flow';
export type ExportFormat = 'pdf' | 'excel' | 'csv';

