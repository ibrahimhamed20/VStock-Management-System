import React from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { 
  DollarOutlined, 
  FileTextOutlined, 
  AccountBookOutlined,
  CalculatorOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import { useAccounts, useJournalEntries, useTrialBalance } from '../hooks';
import { AccountType } from '../types';
import { formatCurrency } from '../../common/utils';

export const AccountingStats: React.FC = () => {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: journalEntries, isLoading: entriesLoading } = useJournalEntries();
  const { data: trialBalance, isLoading: balanceLoading } = useTrialBalance();

  const isLoading = accountsLoading || entriesLoading || balanceLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  // Calculate statistics from accounts and trial balance
  const totalAccounts = accounts?.length || 0;
  const totalJournalEntries = journalEntries?.length || 0;
  
  // Calculate totals from trial balance
  const totalAssets = trialBalance?.summary
    .filter(item => item.type === AccountType.ASSET)
    .reduce((sum, item) => sum + Number(item.balance), 0) || 0;
  
  const totalLiabilities = trialBalance?.summary
    .filter(item => item.type === AccountType.LIABILITY)
    .reduce((sum, item) => sum + Number(item.balance), 0) || 0;
  
  const totalEquity = trialBalance?.summary
    .filter(item => item.type === AccountType.EQUITY)
    .reduce((sum, item) => sum + Number(item.balance), 0) || 0;
  
  const totalRevenue = trialBalance?.summary
    .filter(item => item.type === AccountType.REVENUE)
    .reduce((sum, item) => sum + Number(item.balance), 0) || 0;
  
  const totalExpenses = trialBalance?.summary
    .filter(item => item.type === AccountType.EXPENSE)
    .reduce((sum, item) => sum + Number(item.balance), 0) || 0;

  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <AccountBookOutlined className="mr-2 text-blue-600" />
                  Total Accounts
                </span>
              }
              value={totalAccounts}
              valueStyle={{ color: '#2563eb', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-purple-50 to-violet-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <FileTextOutlined className="mr-2 text-purple-600" />
                  Journal Entries
                </span>
              }
              value={totalJournalEntries}
              valueStyle={{ color: '#7c3aed', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <DollarOutlined className="mr-2 text-green-600" />
                  Total Assets
                </span>
              }
              value={totalAssets}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#059669', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-red-50 to-rose-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <FallOutlined className="mr-2 text-red-600" />
                  Total Liabilities
                </span>
              }
              value={totalLiabilities}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#dc2626', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Financial Summary */}
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-cyan-50 to-sky-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <CalculatorOutlined className="mr-2 text-cyan-600" />
                  Total Equity
                </span>
              }
              value={totalEquity}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#0891b2', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <RiseOutlined className="mr-2 text-green-600" />
                  Total Revenue
                </span>
              }
              value={totalRevenue}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#059669', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-orange-50 to-amber-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <FallOutlined className="mr-2 text-orange-600" />
                  Total Expenses
                </span>
              }
              value={totalExpenses}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#ea580c', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <DollarOutlined className="mr-2 text-indigo-600" />
                  Net Income
                </span>
              }
              value={netIncome}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ 
                color: netIncome >= 0 ? '#059669' : '#dc2626', 
                fontSize: '24px', 
                fontWeight: 'bold' 
              }}
              prefix={netIncome >= 0 ? <RiseOutlined /> : <FallOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

