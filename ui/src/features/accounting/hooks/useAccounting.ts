import { useQuery } from '@tanstack/react-query';
import { accountingService } from '../services';
import type {
  AccountFilters,
  JournalEntryFilters,
} from '../types';

// Account Hooks
export const useAccounts = (filters?: AccountFilters) => {
  return useQuery({
    queryKey: ['accounts', filters],
    queryFn: () => accountingService.getAccounts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAccountsTree = () => {
  return useQuery({
    queryKey: ['accounts', 'tree'],
    queryFn: () => accountingService.getAccountsTree(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAccountById = (id: string) => {
  return useQuery({
    queryKey: ['account', id],
    queryFn: () => accountingService.getAccountById(id),
    enabled: !!id,
  });
};

// Journal Entry Hooks
export const useJournalEntries = (filters?: JournalEntryFilters) => {
  return useQuery({
    queryKey: ['journal-entries', filters],
    queryFn: () => accountingService.getJournalEntries(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useJournalEntryById = (id: string) => {
  return useQuery({
    queryKey: ['journal-entry', id],
    queryFn: () => accountingService.getJournalEntryById(id),
    enabled: !!id,
  });
};

// General Ledger Hooks
export const useGeneralLedger = (accountId: string | undefined) => {
  return useQuery({
    queryKey: ['general-ledger', accountId],
    queryFn: () => accountingService.getGeneralLedger(accountId!),
    enabled: !!accountId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Trial Balance Hooks
export const useTrialBalance = () => {
  return useQuery({
    queryKey: ['trial-balance'],
    queryFn: () => accountingService.getTrialBalance(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Financial Reports Hooks
export const useBalanceSheet = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['balance-sheet', startDate, endDate],
    queryFn: () => accountingService.getBalanceSheet(startDate, endDate),
    staleTime: 2 * 60 * 1000,
  });
};

export const useIncomeStatement = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['income-statement', startDate, endDate],
    queryFn: () => accountingService.getIncomeStatement(startDate, endDate),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCashFlowStatement = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['cash-flow', startDate, endDate],
    queryFn: () => accountingService.getCashFlowStatement(startDate, endDate),
    staleTime: 2 * 60 * 1000,
  });
};

