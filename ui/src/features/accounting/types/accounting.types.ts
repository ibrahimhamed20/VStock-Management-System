export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
}

export enum JournalEntryLineType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  balance: number;
  parentId?: string;
  parent?: Account;
  children?: Account[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  account?: Account;
  amount: number;
  type: JournalEntryLineType;
  description?: string;
}

export interface JournalEntry {
  id: string;
  code?: string;
  date: Date | string;
  reference?: string;
  description?: string;
  lines: JournalEntryLine[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccountData {
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
}

export interface UpdateAccountData {
  code?: string;
  name?: string;
  type?: AccountType;
  parentId?: string;
}

export interface CreateJournalEntryData {
  date: string;
  reference?: string;
  description?: string;
  lines: Array<{
    accountId: string;
    type: JournalEntryLineType;
    amount: number;
    description?: string;
  }>;
}

export interface JournalEntryLineForm {
  id: string;
  accountId: string;
  accountName?: string;
  accountCode?: string;
  type: JournalEntryLineType;
  amount: number;
  description?: string;
}

export interface GeneralLedgerEntry {
  account: Account;
  entries: JournalEntry[];
}

export interface TrialBalanceItem {
  code: string;
  name: string;
  type: AccountType;
  balance: number;
  debit?: number;
  credit?: number;
}

export interface TrialBalance {
  summary: TrialBalanceItem[];
  totalDebits: number;
  totalCredits: number;
}

export interface AccountingStatistics {
  totalAccounts: number;
  totalJournalEntries: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export interface AccountFilters {
  type?: AccountType;
  search?: string;
}

export interface JournalEntryFilters {
  accountId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Financial Reports
export interface BalanceSheet {
  assets: Array<{ code: string; name: string; balance: number }>;
  liabilities: Array<{ code: string; name: string; balance: number }>;
  equity: Array<{ code: string; name: string; balance: number }>;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  asOfDate: string;
}

export interface IncomeStatement {
  revenue: Array<{ code: string; name: string; balance: number }>;
  expenses: Array<{ code: string; name: string; balance: number }>;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  period: {
    startDate: string | null;
    endDate: string;
  };
}

export interface CashFlowActivity {
  description: string;
  amount: number;
  type: 'inflow' | 'outflow';
}

export interface CashFlowStatement {
  operatingActivities: CashFlowActivity[];
  investingActivities: CashFlowActivity[];
  financingActivities: CashFlowActivity[];
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
  period: {
    startDate: string | null;
    endDate: string;
  };
}

// Account Reconciliation
export interface ReconciliationData {
  account: {
    id: string;
    code: string;
    name: string;
    type: AccountType;
  };
  statementBalance: number;
  bookBalance: number;
  difference: number;
  entries: JournalEntry[];
  reconciled: boolean;
  statementDate: string;
  reconciledAt: string;
}

export interface ReconcileAccountData {
  statementBalance: number;
  statementDate: string;
}

