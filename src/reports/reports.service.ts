import { Injectable } from '@nestjs/common';
import { AccountingService } from '../accounting/accounting.service';
import { ReportFilterDto } from './dtos/report-filter.dto';
import { AccountType } from '../accounting/entities/account.entity';
import { SettingsService } from '../settings/settings.service';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

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

  async exportBalanceSheet(
    filter: ReportFilterDto,
    format: 'pdf' | 'excel' | 'csv',
    res: Response,
  ) {
    const data = await this.getBalanceSheet(filter);
    const settings = await this.settingsService.getSettings();
    const companyName = settings.companyName || 'Company';
    const asOfDate = new Date(data.asOf).toLocaleDateString();

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Balance Sheet');

      // Header
      worksheet.mergeCells('A1:D1');
      worksheet.getCell('A1').value = `${companyName} - Balance Sheet`;
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };

      worksheet.mergeCells('A2:D2');
      worksheet.getCell('A2').value = `As of ${asOfDate}`;
      worksheet.getCell('A2').alignment = { horizontal: 'center' };

      // Assets section
      worksheet.getCell('A4').value = 'ASSETS';
      worksheet.getCell('A4').font = { bold: true };
      worksheet.getCell('A5').value = 'Code';
      worksheet.getCell('B5').value = 'Account Name';
      worksheet.getCell('C5').value = 'Balance';
      ['A5', 'B5', 'C5'].forEach(cell => {
        worksheet.getCell(cell).font = { bold: true };
      });

      let row = 6;
      data.assets.forEach((asset) => {
        worksheet.getCell(`A${row}`).value = asset.code;
        worksheet.getCell(`B${row}`).value = asset.name;
        worksheet.getCell(`C${row}`).value = Number(asset.balance);
        worksheet.getCell(`C${row}`).numFmt = '$#,##0.00';
        row++;
      });
      worksheet.getCell(`C${row}`).value = data.totalAssets;
      worksheet.getCell(`C${row}`).numFmt = '$#,##0.00';
      worksheet.getCell(`C${row}`).font = { bold: true };
      worksheet.getCell(`B${row}`).value = 'Total Assets';
      worksheet.getCell(`B${row}`).font = { bold: true };

      // Liabilities section
      row += 2;
      worksheet.getCell(`A${row}`).value = 'LIABILITIES';
      worksheet.getCell(`A${row}`).font = { bold: true };
      row++;
      worksheet.getCell(`A${row}`).value = 'Code';
      worksheet.getCell(`B${row}`).value = 'Account Name';
      worksheet.getCell(`C${row}`).value = 'Balance';
      ['A' + row, 'B' + row, 'C' + row].forEach(cell => {
        worksheet.getCell(cell).font = { bold: true };
      });

      row++;
      data.liabilities.forEach((liability) => {
        worksheet.getCell(`A${row}`).value = liability.code;
        worksheet.getCell(`B${row}`).value = liability.name;
        worksheet.getCell(`C${row}`).value = Number(liability.balance);
        worksheet.getCell(`C${row}`).numFmt = '$#,##0.00';
        row++;
      });
      worksheet.getCell(`C${row}`).value = data.totalLiabilities;
      worksheet.getCell(`C${row}`).numFmt = '$#,##0.00';
      worksheet.getCell(`C${row}`).font = { bold: true };
      worksheet.getCell(`B${row}`).value = 'Total Liabilities';
      worksheet.getCell(`B${row}`).font = { bold: true };

      // Equity section
      row += 2;
      worksheet.getCell(`A${row}`).value = 'EQUITY';
      worksheet.getCell(`A${row}`).font = { bold: true };
      row++;
      worksheet.getCell(`A${row}`).value = 'Code';
      worksheet.getCell(`B${row}`).value = 'Account Name';
      worksheet.getCell(`C${row}`).value = 'Balance';
      ['A' + row, 'B' + row, 'C' + row].forEach(cell => {
        worksheet.getCell(cell).font = { bold: true };
      });

      row++;
      data.equity.forEach((eq) => {
        worksheet.getCell(`A${row}`).value = eq.code;
        worksheet.getCell(`B${row}`).value = eq.name;
        worksheet.getCell(`C${row}`).value = Number(eq.balance);
        worksheet.getCell(`C${row}`).numFmt = '$#,##0.00';
        row++;
      });
      worksheet.getCell(`C${row}`).value = data.totalEquity;
      worksheet.getCell(`C${row}`).numFmt = '$#,##0.00';
      worksheet.getCell(`C${row}`).font = { bold: true };
      worksheet.getCell(`B${row}`).value = 'Total Equity';
      worksheet.getCell(`B${row}`).font = { bold: true };

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=balance-sheet-${Date.now()}.xlsx`,
      );

      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=balance-sheet-${Date.now()}.pdf`,
      );
      doc.pipe(res);

      doc.fontSize(20).text(`${companyName} - Balance Sheet`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`As of ${asOfDate}`, { align: 'center' });
      doc.moveDown(2);

      // Assets
      doc.fontSize(14).text('ASSETS', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      data.assets.forEach((asset) => {
        doc.text(`${asset.code} - ${asset.name}`, { continued: true });
        doc.text(`$${Number(asset.balance).toFixed(2)}`, { align: 'right' });
      });
      doc.moveDown();
      doc.fontSize(12).text('Total Assets', { continued: true });
      doc.text(`$${data.totalAssets.toFixed(2)}`, { align: 'right' });
      doc.moveDown(2);

      // Liabilities
      doc.fontSize(14).text('LIABILITIES', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      data.liabilities.forEach((liability) => {
        doc.text(`${liability.code} - ${liability.name}`, { continued: true });
        doc.text(`$${Number(liability.balance).toFixed(2)}`, { align: 'right' });
      });
      doc.moveDown();
      doc.fontSize(12).text('Total Liabilities', { continued: true });
      doc.text(`$${data.totalLiabilities.toFixed(2)}`, { align: 'right' });
      doc.moveDown(2);

      // Equity
      doc.fontSize(14).text('EQUITY', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      data.equity.forEach((eq) => {
        doc.text(`${eq.code} - ${eq.name}`, { continued: true });
        doc.text(`$${Number(eq.balance).toFixed(2)}`, { align: 'right' });
      });
      doc.moveDown();
      doc.fontSize(12).text('Total Equity', { continued: true });
      doc.text(`$${data.totalEquity.toFixed(2)}`, { align: 'right' });

      doc.end();
    } else if (format === 'csv') {
      const csvData = [
        ...data.assets.map((a) => ({ code: a.code, name: a.name, balance: Number(a.balance), type: 'Asset' })),
        ...data.liabilities.map((l) => ({ code: l.code, name: l.name, balance: Number(l.balance), type: 'Liability' })),
        ...data.equity.map((e) => ({ code: e.code, name: e.name, balance: Number(e.balance), type: 'Equity' })),
      ];

      const headers = ['Code', 'Account Name', 'Balance', 'Type'];
      const rows = csvData.map((row) => [
        row.code,
        row.name,
        row.balance.toFixed(2),
        row.type,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=balance-sheet-${Date.now()}.csv`,
      );
      res.send(csvContent);
    }
  }

  async exportIncomeStatement(
    filter: ReportFilterDto,
    format: 'pdf' | 'excel' | 'csv',
    res: Response,
  ) {
    const data = await this.getIncomeStatement(filter);
    const settings = await this.settingsService.getSettings();
    const companyName = settings.companyName || 'Company';
    const fromDate = new Date(data.from ?? '').toLocaleDateString();
    const toDate = new Date(data.to ?? '').toLocaleDateString();

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Income Statement');

      worksheet.mergeCells('A1:D1');
      worksheet.getCell('A1').value = `${companyName} - Income Statement`;
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };

      worksheet.mergeCells('A2:D2');
      worksheet.getCell('A2').value = `From ${fromDate} to ${toDate}`;
      worksheet.getCell('A2').alignment = { horizontal: 'center' };

      worksheet.getCell('A4').value = 'REVENUE';
      worksheet.getCell('A4').font = { bold: true };
      worksheet.getCell('A5').value = 'Account ID';
      worksheet.getCell('B5').value = 'Amount';
      ['A5', 'B5'].forEach(cell => {
        worksheet.getCell(cell).font = { bold: true };
      });

      let row = 6;
      data.revenue.forEach((rev) => {
        worksheet.getCell(`A${row}`).value = rev.accountId;
        worksheet.getCell(`B${row}`).value = Number(rev.amount);
        worksheet.getCell(`B${row}`).numFmt = '$#,##0.00';
        row++;
      });
      worksheet.getCell(`B${row}`).value = data.totalRevenue;
      worksheet.getCell(`B${row}`).numFmt = '$#,##0.00';
      worksheet.getCell(`B${row}`).font = { bold: true };
      worksheet.getCell(`A${row}`).value = 'Total Revenue';
      worksheet.getCell(`A${row}`).font = { bold: true };

      row += 2;
      worksheet.getCell(`A${row}`).value = 'EXPENSES';
      worksheet.getCell(`A${row}`).font = { bold: true };
      row++;
      worksheet.getCell(`A${row}`).value = 'Account ID';
      worksheet.getCell(`B${row}`).value = 'Amount';
      ['A' + row, 'B' + row].forEach(cell => {
        worksheet.getCell(cell).font = { bold: true };
      });

      row++;
      data.expenses.forEach((exp) => {
        worksheet.getCell(`A${row}`).value = exp.accountId;
        worksheet.getCell(`B${row}`).value = Number(exp.amount);
        worksheet.getCell(`B${row}`).numFmt = '$#,##0.00';
        row++;
      });
      worksheet.getCell(`B${row}`).value = data.totalExpenses;
      worksheet.getCell(`B${row}`).numFmt = '$#,##0.00';
      worksheet.getCell(`B${row}`).font = { bold: true };
      worksheet.getCell(`A${row}`).value = 'Total Expenses';
      worksheet.getCell(`A${row}`).font = { bold: true };

      row += 2;
      worksheet.getCell(`A${row}`).value = 'NET INCOME';
      worksheet.getCell(`A${row}`).font = { bold: true };
      worksheet.getCell(`B${row}`).value = data.netIncome;
      worksheet.getCell(`B${row}`).numFmt = '$#,##0.00';
      worksheet.getCell(`B${row}`).font = { bold: true };

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=income-statement-${Date.now()}.xlsx`,
      );

      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=income-statement-${Date.now()}.pdf`,
      );
      doc.pipe(res);

      doc.fontSize(20).text(`${companyName} - Income Statement`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`From ${fromDate} to ${toDate}`, { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(14).text('REVENUE', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      data.revenue.forEach((rev) => {
        doc.text(`${rev.accountId}`, { continued: true });
        doc.text(`$${Number(rev.amount).toFixed(2)}`, { align: 'right' });
      });
      doc.moveDown();
      doc.fontSize(12).text('Total Revenue', { continued: true });
      doc.text(`$${data.totalRevenue.toFixed(2)}`, { align: 'right' });
      doc.moveDown(2);

      doc.fontSize(14).text('EXPENSES', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      data.expenses.forEach((exp) => {
        doc.text(`${exp.accountId}`, { continued: true });
        doc.text(`$${Number(exp.amount).toFixed(2)}`, { align: 'right' });
      });
      doc.moveDown();
      doc.fontSize(12).text('Total Expenses', { continued: true });
      doc.text(`$${data.totalExpenses.toFixed(2)}`, { align: 'right' });
      doc.moveDown(2);

      doc.fontSize(14).text('NET INCOME', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`$${data.netIncome.toFixed(2)}`, { align: 'right' });

      doc.end();
    } else if (format === 'csv') {
      const csvData = [
        ...data.revenue.map((r) => ({ accountId: r.accountId, amount: r.amount, type: 'Revenue' })),
        ...data.expenses.map((e) => ({ accountId: e.accountId, amount: e.amount, type: 'Expense' })),
      ];

      const headers = ['Account ID', 'Amount', 'Type'];
      const rows = csvData.map((row) => [
        row.accountId,
        row.amount.toFixed(2),
        row.type,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=income-statement-${Date.now()}.csv`,
      );
      res.send(csvContent);
    }
  }

  async exportCashFlowStatement(
    filter: ReportFilterDto,
    format: 'pdf' | 'excel' | 'csv',
    res: Response,
  ) {
    const data = await this.getCashFlowStatement(filter);
    const settings = await this.settingsService.getSettings();
    const companyName = settings.companyName || 'Company';
    const fromDate = new Date(data.from ?? '').toLocaleDateString();
    const toDate = new Date(data.to ?? '').toLocaleDateString();

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Cash Flow Statement');

      worksheet.mergeCells('A1:E1');
      worksheet.getCell('A1').value = `${companyName} - Cash Flow Statement`;
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };

      worksheet.mergeCells('A2:E2');
      worksheet.getCell('A2').value = `From ${fromDate} to ${toDate}`;
      worksheet.getCell('A2').alignment = { horizontal: 'center' };

      worksheet.getCell('A4').value = 'Date';
      worksheet.getCell('B4').value = 'Account';
      worksheet.getCell('C4').value = 'Type';
      worksheet.getCell('D4').value = 'Amount';
      worksheet.getCell('E4').value = 'Description';
      ['A4', 'B4', 'C4', 'D4', 'E4'].forEach(cell => {
        worksheet.getCell(cell).font = { bold: true };
      });

      let row = 5;
      data.details.forEach((detail) => {
        worksheet.getCell(`A${row}`).value = new Date(detail.date);
        worksheet.getCell(`A${row}`).numFmt = 'mm/dd/yyyy';
        worksheet.getCell(`B${row}`).value = detail.accountName;
        worksheet.getCell(`C${row}`).value = detail.type.toUpperCase();
        worksheet.getCell(`D${row}`).value = Number(detail.amount);
        worksheet.getCell(`D${row}`).numFmt = '$#,##0.00';
        worksheet.getCell(`E${row}`).value = detail.description || '';
        row++;
      });

      row += 2;
      worksheet.getCell(`C${row}`).value = 'Total Inflows';
      worksheet.getCell(`C${row}`).font = { bold: true };
      worksheet.getCell(`D${row}`).value = data.inflows;
      worksheet.getCell(`D${row}`).numFmt = '$#,##0.00';
      worksheet.getCell(`D${row}`).font = { bold: true };

      row++;
      worksheet.getCell(`C${row}`).value = 'Total Outflows';
      worksheet.getCell(`C${row}`).font = { bold: true };
      worksheet.getCell(`D${row}`).value = data.outflows;
      worksheet.getCell(`D${row}`).numFmt = '$#,##0.00';
      worksheet.getCell(`D${row}`).font = { bold: true };

      row++;
      worksheet.getCell(`C${row}`).value = 'Net Cash Flow';
      worksheet.getCell(`C${row}`).font = { bold: true };
      worksheet.getCell(`D${row}`).value = data.netCashFlow;
      worksheet.getCell(`D${row}`).numFmt = '$#,##0.00';
      worksheet.getCell(`D${row}`).font = { bold: true };

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=cash-flow-${Date.now()}.xlsx`,
      );

      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=cash-flow-${Date.now()}.pdf`,
      );
      doc.pipe(res);

      doc.fontSize(20).text(`${companyName} - Cash Flow Statement`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`From ${fromDate} to ${toDate}`, { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(10);
      data.details.forEach((detail) => {
        const date = new Date(detail.date).toLocaleDateString();
        doc.text(`${date} - ${detail.accountName} (${detail.type.toUpperCase()})`, { continued: true });
        doc.text(`$${Math.abs(Number(detail.amount)).toFixed(2)}`, { align: 'right' });
        if (detail.description) {
          doc.moveDown(0.5);
          doc.fontSize(8).text(detail.description, { indent: 20 });
          doc.fontSize(10);
        }
        doc.moveDown();
      });

      doc.moveDown();
      doc.fontSize(12).text('Total Inflows', { continued: true });
      doc.text(`$${data.inflows.toFixed(2)}`, { align: 'right' });
      doc.moveDown();
      doc.fontSize(12).text('Total Outflows', { continued: true });
      doc.text(`$${data.outflows.toFixed(2)}`, { align: 'right' });
      doc.moveDown();
      doc.fontSize(14).text('Net Cash Flow', { continued: true });
      doc.text(`$${data.netCashFlow.toFixed(2)}`, { align: 'right' });

      doc.end();
    } else if (format === 'csv') {
      const headers = ['Date', 'Account', 'Type', 'Amount', 'Description'];
      const rows = data.details.map((detail) => [
        new Date(detail.date).toISOString().split('T')[0],
        detail.accountName,
        detail.type.toUpperCase(),
        Math.abs(Number(detail.amount)).toFixed(2),
        detail.description || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=cash-flow-${Date.now()}.csv`,
      );
      res.send(csvContent);
    }
  }
}
