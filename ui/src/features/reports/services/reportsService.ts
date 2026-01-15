import { apiService } from '@core/services/api';
import type {
  ReportFilter,
  BalanceSheetReport,
  IncomeStatementReport,
  CashFlowReport,
  ExportFormat,
} from '../types';

export const reportsService = {
  async getBalanceSheet(filter: ReportFilter = {}): Promise<BalanceSheetReport> {
    const params = new URLSearchParams();
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.fiscalYear) params.append('fiscalYear', filter.fiscalYear);

    const queryString = params.toString();
    const url = `/reports/balance-sheet${queryString ? `?${queryString}` : ''}`;
    return await apiService.get<BalanceSheetReport>(url);
  },

  async getIncomeStatement(filter: ReportFilter = {}): Promise<IncomeStatementReport> {
    const params = new URLSearchParams();
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.fiscalYear) params.append('fiscalYear', filter.fiscalYear);

    const queryString = params.toString();
    const url = `/reports/income-statement${queryString ? `?${queryString}` : ''}`;
    return await apiService.get<IncomeStatementReport>(url);
  },

  async getCashFlowStatement(filter: ReportFilter = {}): Promise<CashFlowReport> {
    const params = new URLSearchParams();
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.fiscalYear) params.append('fiscalYear', filter.fiscalYear);

    const queryString = params.toString();
    const url = `/reports/cash-flow${queryString ? `?${queryString}` : ''}`;
    return await apiService.get<CashFlowReport>(url);
  },

  async exportReport(
    reportType: 'balance-sheet' | 'income-statement' | 'cash-flow',
    format: ExportFormat,
    filter: ReportFilter = {},
  ): Promise<Blob> {
    const params = new URLSearchParams();
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.fiscalYear) params.append('fiscalYear', filter.fiscalYear);
    params.append('format', format);

    const queryString = params.toString();
    const url = `/reports/${reportType}/export${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${url}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return await response.blob();
  },
};

