import React from 'react';
import { Typography, Divider } from 'antd';
import { useTrialBalance } from '../hooks';
import { AccountType } from '../types';
import { formatCurrency } from '../../common/utils';

const { Text, Title } = Typography;

export const TrialBalanceSummary: React.FC = () => {
  const { data: trialBalance, isLoading } = useTrialBalance();

  if (isLoading || !trialBalance) {
    return <Text type="secondary">Loading...</Text>;
  }

  const assets = trialBalance.summary.filter(item => item.type === AccountType.ASSET);
  const liabilities = trialBalance.summary.filter(item => item.type === AccountType.LIABILITY);
  const equity = trialBalance.summary.filter(item => item.type === AccountType.EQUITY);
  const revenue = trialBalance.summary.filter(item => item.type === AccountType.REVENUE);
  const expenses = trialBalance.summary.filter(item => item.type === AccountType.EXPENSE);

  return (
    <div className="space-y-4">
      <div>
        <Text type="secondary" className="text-sm">Assets</Text>
        <Title level={5} className="mt-1 mb-0">
          {formatCurrency(assets.reduce((sum, item) => sum + Number(item.balance), 0))}
        </Title>
      </div>

      <div>
        <Text type="secondary" className="text-sm">Liabilities</Text>
        <Title level={5} className="mt-1 mb-0">
          {formatCurrency(liabilities.reduce((sum, item) => sum + Number(item.balance), 0))}
        </Title>
      </div>

      <div>
        <Text type="secondary" className="text-sm">Equity</Text>
        <Title level={5} className="mt-1 mb-0">
          {formatCurrency(equity.reduce((sum, item) => sum + Number(item.balance), 0))}
        </Title>
      </div>

      <Divider />

      <div>
        <Text type="secondary" className="text-sm">Revenue</Text>
        <Title level={5} className="mt-1 mb-0 text-green-600">
          {formatCurrency(revenue.reduce((sum, item) => sum + Number(item.balance), 0))}
        </Title>
      </div>

      <div>
        <Text type="secondary" className="text-sm">Expenses</Text>
        <Title level={5} className="mt-1 mb-0 text-red-600">
          {formatCurrency(expenses.reduce((sum, item) => sum + Number(item.balance), 0))}
        </Title>
      </div>

      <Divider />

      <div>
        <Text strong className="text-sm">Total Debits</Text>
        <Title level={5} className="mt-1 mb-0">
          {formatCurrency(trialBalance.totalDebits)}
        </Title>
      </div>

      <div>
        <Text strong className="text-sm">Total Credits</Text>
        <Title level={5} className="mt-1 mb-0">
          {formatCurrency(trialBalance.totalCredits)}
        </Title>
      </div>

      <div className="pt-2">
        <Text 
          strong 
          className={trialBalance.totalDebits === trialBalance.totalCredits ? 'text-green-600' : 'text-red-600'}
        >
          {trialBalance.totalDebits === trialBalance.totalCredits ? '✓ Balanced' : '✗ Unbalanced'}
        </Text>
      </div>
    </div>
  );
};

