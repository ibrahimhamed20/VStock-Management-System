import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services';
import type { ReportFilter } from '../types';

export const useBalanceSheet = (filter: ReportFilter = {}) => {
  return useQuery({
    queryKey: ['reports', 'balance-sheet', filter],
    queryFn: () => reportsService.getBalanceSheet(filter),
  });
};

export const useIncomeStatement = (filter: ReportFilter = {}) => {
  return useQuery({
    queryKey: ['reports', 'income-statement', filter],
    queryFn: () => reportsService.getIncomeStatement(filter),
  });
};

export const useCashFlowStatement = (filter: ReportFilter = {}) => {
  return useQuery({
    queryKey: ['reports', 'cash-flow', filter],
    queryFn: () => reportsService.getCashFlowStatement(filter),
  });
};

