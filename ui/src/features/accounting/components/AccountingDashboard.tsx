import React from 'react';
import { Card, Row, Col, Typography, Spin, Alert, Space, Button } from 'antd';
import { 
  ReloadOutlined, 
  AccountBookOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useAccounts, useJournalEntries, useTrialBalance } from '../hooks';
import { AccountingStats } from './AccountingStats';
import { RecentJournalEntries } from './RecentJournalEntries';
import { TrialBalanceSummary } from './TrialBalanceSummary';

const { Title, Text } = Typography;

export const AccountingDashboard: React.FC = () => {
  const { isLoading: accountsLoading, error: accountsError, refetch: refetchAccounts } = useAccounts();
  const { isLoading: entriesLoading, error: entriesError, refetch: refetchEntries } = useJournalEntries();
  const { isLoading: balanceLoading, error: balanceError, refetch: refetchBalance } = useTrialBalance();

  const isLoading = accountsLoading || entriesLoading || balanceLoading;
  const hasError = accountsError || entriesError || balanceError;

  const handleRefresh = () => {
    refetchAccounts();
    refetchEntries();
    refetchBalance();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (hasError) {
    return (
      <Alert
        message="Error loading dashboard"
        description="Failed to fetch accounting data. Please try again."
        type="error"
        showIcon
        action={
          <Button size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="text-gray-900 mb-2">
            Accounting Dashboard
          </Title>
          <Text className="text-gray-600 text-lg">
            Overview of your financial accounts and transactions
          </Text>
        </div>
        <Button 
          type="default" 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
          className="bg-white hover:bg-gray-50"
        >
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <AccountingStats />

      {/* Charts and Recent Activity */}
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <FileTextOutlined className="text-blue-600" />
                <span>Recent Journal Entries</span>
              </Space>
            }
            className="shadow-lg border-0 rounded-xl h-full"
          >
            <RecentJournalEntries />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <AccountBookOutlined className="text-green-600" />
                <span>Trial Balance Summary</span>
              </Space>
            }
            className="shadow-lg border-0 rounded-xl h-full"
          >
            <TrialBalanceSummary />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

