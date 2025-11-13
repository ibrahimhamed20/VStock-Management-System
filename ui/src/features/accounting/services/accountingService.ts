import apiService from '../../core/services/api';
import type {
  Account,
  JournalEntry,
  CreateAccountData,
  UpdateAccountData,
  CreateJournalEntryData,
  GeneralLedgerEntry,
  TrialBalance,
  AccountFilters,
  JournalEntryFilters,
  BalanceSheet,
  IncomeStatement,
  CashFlowStatement,
  ReconciliationData,
  ReconcileAccountData,
} from '../types';

class AccountingService {
  // Account Management
  async getAccounts(filters?: AccountFilters): Promise<Account[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiService.get<Account[]>(`/accounting/accounts?${params.toString()}`);
    return response;
  }

  async getAccountsTree(): Promise<Account[]> {
    return await apiService.get<Account[]>('/accounting/accounts');
  }

  async getAccountById(id: string): Promise<Account> {
    return await apiService.get<Account>(`/accounting/accounts/${id}`);
  }

  async createAccount(data: CreateAccountData): Promise<Account> {
    return await apiService.post<Account>('/accounting/accounts', data);
  }

  async updateAccount(id: string, data: UpdateAccountData): Promise<Account> {
    return await apiService.put<Account>(`/accounting/accounts/${id}`, data);
  }

  async deleteAccount(id: string): Promise<{ message: string }> {
    return await apiService.delete<{ message: string }>(`/accounting/accounts/${id}`);
  }

  // Journal Entry Management
  async getJournalEntries(filters?: JournalEntryFilters): Promise<JournalEntry[]> {
    const params = new URLSearchParams();
    if (filters?.accountId) params.append('accountId', filters.accountId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiService.get<JournalEntry[]>(`/accounting/journal-entries?${params.toString()}`);
    
    // Apply client-side search filter if provided
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      return response.filter(entry =>
        entry.code?.toLowerCase().includes(searchLower) ||
        entry.reference?.toLowerCase().includes(searchLower) ||
        entry.description?.toLowerCase().includes(searchLower)
      );
    }

    return response;
  }

  async getJournalEntryById(id: string): Promise<JournalEntry> {
    return await apiService.get<JournalEntry>(`/accounting/journal-entries/${id}`);
  }

  async createJournalEntry(data: CreateJournalEntryData): Promise<JournalEntry> {
    return await apiService.post<JournalEntry>('/accounting/journal-entries', data);
  }

  async updateJournalEntry(id: string, data: CreateJournalEntryData): Promise<JournalEntry> {
    return await apiService.put<JournalEntry>(`/accounting/journal-entries/${id}`, data);
  }

  async deleteJournalEntry(id: string): Promise<{ message: string }> {
    return await apiService.delete<{ message: string }>(`/accounting/journal-entries/${id}`);
  }

  // General Ledger
  async getGeneralLedger(accountId: string): Promise<GeneralLedgerEntry> {
    return await apiService.get<GeneralLedgerEntry>(`/accounting/general-ledger?accountId=${accountId}`);
  }

  // Trial Balance
  async getTrialBalance(): Promise<TrialBalance> {
    return await apiService.get<TrialBalance>('/accounting/trial-balance');
  }

  // Financial Reports
  async getBalanceSheet(startDate?: string, endDate?: string): Promise<BalanceSheet> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return await apiService.get<BalanceSheet>(`/accounting/reports/balance-sheet?${params.toString()}`);
  }

  async getIncomeStatement(startDate?: string, endDate?: string): Promise<IncomeStatement> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return await apiService.get<IncomeStatement>(`/accounting/reports/income-statement?${params.toString()}`);
  }

  async getCashFlowStatement(startDate?: string, endDate?: string): Promise<CashFlowStatement> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return await apiService.get<CashFlowStatement>(`/accounting/reports/cash-flow?${params.toString()}`);
  }

  // Account Reconciliation
  async reconcileAccount(accountId: string, data: ReconcileAccountData): Promise<ReconciliationData> {
    return await apiService.post<ReconciliationData>(`/accounting/accounts/${accountId}/reconcile`, data);
  }
}

export const accountingService = new AccountingService();

