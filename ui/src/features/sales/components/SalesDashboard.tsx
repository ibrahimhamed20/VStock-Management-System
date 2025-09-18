import React from 'react';
import { Card, Row, Col, Typography, Spin, Alert, Space, Button } from 'antd';
import { 
  ReloadOutlined, 
  DollarOutlined, 
  FileTextOutlined,
  RiseOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useDashboardStats, useOverdueInvoices, useTopProducts, useSalesTrend } from '../hooks';
import { SalesStats } from './SalesStats';
import { RecentInvoices } from './RecentInvoices';
import { TopProductsChart } from './TopProductsChart';
import { SalesTrendChart } from './SalesTrendChart';
import { OverdueInvoicesAlert } from './OverdueInvoicesAlert';
import { useHasRole } from '@auth/stores';

const { Title, Text } = Typography;

export const SalesDashboard: React.FC = () => {
  const { isLoading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useDashboardStats();
  const { data: overdueInvoices, refetch: refetchOverdue } = useOverdueInvoices();
  const { data: topProducts, isLoading: topProductsLoading, error: topProductsError, refetch: refetchTopProducts } = useTopProducts(5);
  const { data: salesTrend, isLoading: trendLoading, error: trendError, refetch: refetchTrend } = useSalesTrend(6);
  
  // Check user roles for analytics access
  const isAdmin = useHasRole('admin');
  const isAccountant = useHasRole('accountant');
  const hasAnalyticsAccess = isAdmin || isAccountant;
  
  // Check if analytics failed due to unauthorized access
  const topProductsErrorResponse = (topProductsError as { response?: { status?: number } })?.response;
  const trendErrorResponse = (trendError as { response?: { status?: number } })?.response;
  const analyticsUnauthorized = (topProductsErrorResponse?.status === 401 || topProductsErrorResponse?.status === 403) ||
                               (trendErrorResponse?.status === 401 || trendErrorResponse?.status === 403);

  const handleRefresh = () => {
    refetchDashboard();
    refetchOverdue();
    refetchTopProducts();
    refetchTrend();
  };

  if (dashboardLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (dashboardError) {
    return (
      <Alert
        message="Error loading dashboard"
        description="Failed to fetch sales dashboard data. Please try again."
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
            Sales Dashboard
          </Title>
          <Text className="text-gray-600 text-lg">
            Overview of your sales performance and key metrics
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <SalesStats />

      {/* Alerts */}
      {overdueInvoices && overdueInvoices.length > 0 && (
        <OverdueInvoicesAlert invoices={overdueInvoices} />
      )}

      {/* Charts and Analytics */}
      {hasAnalyticsAccess && !analyticsUnauthorized ? (
        <Row gutter={[16, 16]} align="stretch">
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <RiseOutlined className="text-blue-600" />
                  <span>Sales Trend</span>
                </Space>
              }
              className="shadow-lg border-0 rounded-xl h-full min-h-[400px]"
            >
              {trendLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Spin size="large" />
                </div>
              ) : (
                <SalesTrendChart data={salesTrend || []} />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <DollarOutlined className="text-green-600" />
                  <span>Top Products</span>
                </Space>
              }
              className="shadow-lg border-0 rounded-xl h-full min-h-[400px]"
            >
              {topProductsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Spin size="large" />
                </div>
              ) : (
                <TopProductsChart data={topProducts || []} />
              )}
            </Card>
          </Col>
        </Row>
      ) : (
        <Card className="shadow-lg border-0 rounded-xl">
          <div className="text-center py-12">
            <LockOutlined className="text-6xl text-gray-400 mb-4" />
            <Title level={4} className="text-gray-600 mb-2">
              {analyticsUnauthorized ? 'Analytics Access Denied' : 'Analytics Access Required'}
            </Title>
            <Text className="text-gray-500">
              {analyticsUnauthorized 
                ? 'You do not have permission to view sales analytics and charts.'
                : 'You need Admin or Accountant role to view sales analytics and charts.'
              }
            </Text>
          </div>
        </Card>
      )}

      {/* Recent Invoices */}
      <Card 
        title={
          <Space>
            <FileTextOutlined className="text-purple-600" />
            <span>Recent Invoices</span>
          </Space>
        }
        className="shadow-lg border-0 rounded-xl"
      >
        <RecentInvoices />
      </Card>
    </div>
  );
};
