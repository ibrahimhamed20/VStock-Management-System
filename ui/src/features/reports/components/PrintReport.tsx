import React, { useRef } from 'react';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import type { BalanceSheetReport, IncomeStatementReport, CashFlowReport } from '../types';
import type { Settings } from '@features/settings/types';
import dayjs from 'dayjs';

interface PrintReportProps {
  reportType: 'balance-sheet' | 'income-statement' | 'cash-flow';
  report: BalanceSheetReport | IncomeStatementReport | CashFlowReport;
  settings?: Settings;
}

export const PrintReport: React.FC<PrintReportProps> = ({ reportType, report, settings }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportType.replace('-', ' ').toUpperCase()}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            .report-header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #333;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .report-title {
              font-size: 28px;
              font-weight: bold;
              margin: 20px 0;
            }
            .report-date {
              font-size: 14px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f5f5f5;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              border-bottom: 2px solid #333;
            }
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #ddd;
            }
            .text-right {
              text-align: right;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin: 30px 0 15px 0;
              padding-bottom: 5px;
              border-bottom: 1px solid #ddd;
            }
            .summary {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #333;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
            }
            .summary-row.total {
              font-size: 18px;
              font-weight: bold;
              margin-top: 10px;
              padding-top: 12px;
              border-top: 2px solid #333;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatCurrency = (amount: number) => {
    const currency = settings?.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return dayjs(date).format('MMMM DD, YYYY');
  };

  const renderBalanceSheet = () => {
    const data = report as BalanceSheetReport;
    return (
      <>
        <div className="report-header">
          <div className="company-name">{settings?.companyName || 'Company Name'}</div>
          <div className="report-title">Balance Sheet</div>
          <div className="report-date">As of {formatDate(data.asOf)}</div>
        </div>

        <div className="section-title">ASSETS</div>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Account Name</th>
              <th className="text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.assets.map((asset, index) => (
              <tr key={asset.code || index}>
                <td>{asset.code}</td>
                <td>{asset.name}</td>
                <td className="text-right">{formatCurrency(Number(asset.balance))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="summary">
          <div className="summary-row total">
            <span>Total Assets</span>
            <span>{formatCurrency(data.totalAssets)}</span>
          </div>
        </div>

        <div className="section-title">LIABILITIES</div>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Account Name</th>
              <th className="text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.liabilities.map((liability, index) => (
              <tr key={liability.code || index}>
                <td>{liability.code}</td>
                <td>{liability.name}</td>
                <td className="text-right">{formatCurrency(Number(liability.balance))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="summary">
          <div className="summary-row total">
            <span>Total Liabilities</span>
            <span>{formatCurrency(data.totalLiabilities)}</span>
          </div>
        </div>

        <div className="section-title">EQUITY</div>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Account Name</th>
              <th className="text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.equity.map((eq, index) => (
              <tr key={eq.code || index}>
                <td>{eq.code}</td>
                <td>{eq.name}</td>
                <td className="text-right">{formatCurrency(Number(eq.balance))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="summary">
          <div className="summary-row total">
            <span>Total Equity</span>
            <span>{formatCurrency(data.totalEquity)}</span>
          </div>
        </div>
      </>
    );
  };

  const renderIncomeStatement = () => {
    const data = report as IncomeStatementReport;
    return (
      <>
        <div className="report-header">
          <div className="company-name">{settings?.companyName || 'Company Name'}</div>
          <div className="report-title">Income Statement</div>
          <div className="report-date">
            From {formatDate(data.from)} to {formatDate(data.to)}
          </div>
        </div>

        <div className="section-title">REVENUE</div>
        <table>
          <thead>
            <tr>
              <th>Account ID</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.revenue.map((rev, index) => (
              <tr key={rev.accountId || index}>
                <td>{rev.accountId}</td>
                <td className="text-right">{formatCurrency(rev.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="summary">
          <div className="summary-row total">
            <span>Total Revenue</span>
            <span>{formatCurrency(data.totalRevenue)}</span>
          </div>
        </div>

        <div className="section-title">EXPENSES</div>
        <table>
          <thead>
            <tr>
              <th>Account ID</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.expenses.map((exp, index) => (
              <tr key={exp.accountId || index}>
                <td>{exp.accountId}</td>
                <td className="text-right">{formatCurrency(exp.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="summary">
          <div className="summary-row">
            <span>Total Expenses</span>
            <span>{formatCurrency(data.totalExpenses)}</span>
          </div>
          <div className="summary-row total">
            <span>Net Income</span>
            <span>{formatCurrency(data.netIncome)}</span>
          </div>
        </div>
      </>
    );
  };

  const renderCashFlow = () => {
    const data = report as CashFlowReport;
    return (
      <>
        <div className="report-header">
          <div className="company-name">{settings?.companyName || 'Company Name'}</div>
          <div className="report-title">Cash Flow Statement</div>
          <div className="report-date">
            From {formatDate(data.from)} to {formatDate(data.to)}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Account</th>
              <th>Type</th>
              <th className="text-right">Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {data.details.map((detail, index) => (
              <tr key={`${detail.date}-${index}`}>
                <td>{formatDate(detail.date)}</td>
                <td>{detail.accountName}</td>
                <td>{detail.type.toUpperCase()}</td>
                <td className="text-right">{formatCurrency(Math.abs(detail.amount))}</td>
                <td>{detail.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="summary">
          <div className="summary-row">
            <span>Total Inflows</span>
            <span>{formatCurrency(data.inflows)}</span>
          </div>
          <div className="summary-row">
            <span>Total Outflows</span>
            <span>{formatCurrency(data.outflows)}</span>
          </div>
          <div className="summary-row total">
            <span>Net Cash Flow</span>
            <span>{formatCurrency(data.netCashFlow)}</span>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="no-print">
        <Button
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Print Report
        </Button>
      </div>
      <div ref={printRef} style={{ display: 'none' }}>
        {reportType === 'balance-sheet' && renderBalanceSheet()}
        {reportType === 'income-statement' && renderIncomeStatement()}
        {reportType === 'cash-flow' && renderCashFlow()}
      </div>
    </>
  );
};

