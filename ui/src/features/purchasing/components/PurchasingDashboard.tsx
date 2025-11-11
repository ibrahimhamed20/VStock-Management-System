import React from 'react';
import { Card, Row, Col, Typography, Spin, Alert, Space, Button } from 'antd';
import { 
  ReloadOutlined, 
  DollarOutlined, 
  FileTextOutlined,
  RiseOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useDashboardStats, useOverduePurchases, useTopSuppliers, usePurchaseTrend } from '../hooks';
import { PurchasingStats } from './PurchasingStats';
import { RecentPurchases } from './RecentPurchases';
import { TopSuppliersChart } from './TopSuppliersChart';
import { PurchaseTrendChart } from './PurchaseTrendChart';
import { OverduePurchasesAlert } from './OverduePurchasesAlert';
import { useHasRole } from '@auth/stores';

const { Title, Text } = Typography;

export const PurchasingDashboard: React.FC = () => {
  const { isLoading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useDashboardStats();
  const { data: overduePurchases, refetch: refetchOverdue } = useOverduePurchases();
  const { data: topSuppliers, isLoading: topSuppliersLoading, error: topSuppliersError, refetch: refetchTopSuppliers } = useTopSuppliers(5);
  const { data: purchaseTrend, isLoading: trendLoading, error: trendError, refetch: refetchTrend } = usePurchaseTrend(6);
  
  // Check user roles for analytics access
  const isAdmin = useHasRole('admin');
  const isAccountant = useHasRole('accountant');
  const hasAnalyticsAccess = isAdmin || isAccountant;
  
  // Check if analytics failed due to unauthorized access
  const topSuppliersErrorResponse = (topSuppliersError as { response?: { status?: number } })?.response;
  const trendErrorResponse = (trendError as { response?: { status?: number } })?.response;
  const analyticsUnauthorized = (topSuppliersErrorResponse?.status === 401 || topSuppliersErrorResponse?.status === 403) ||
                               (trendErrorResponse?.status === 401 || trendErrorResponse?.status === 403);

  const handleRefresh = () => {
    refetchDashboard();
    refetchOverdue();
    refetchTopSuppliers();
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
        description="Failed to fetch purchasing dashboard data. Please try again."
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
            Purchasing Dashboard
          </Title>
          <Text className="text-gray-600 text-lg">
            Overview of your procurement performance and key metrics
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
      <PurchasingStats />

      {/* Alerts */}
      {overduePurchases && overduePurchases.length > 0 && (
        <OverduePurchasesAlert purchases={overduePurchases} />
      )}

      {/* Charts and Analytics */}
      {hasAnalyticsAccess && !analyticsUnauthorized ? (
        <Row gutter={[16, 16]} align="stretch">
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <RiseOutlined className="text-blue-600" />
                  <span>Purchase Trend</span>
                </Space>
              }
              className="shadow-lg border-0 rounded-xl h-full min-h-[400px]"
            >
              {trendLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Spin size="large" />
                </div>
              ) : (
                <PurchaseTrendChart data={purchaseTrend || []} />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <DollarOutlined className="text-green-600" />
                  <span>Top Suppliers</span>
                </Space>
              }
              className="shadow-lg border-0 rounded-xl h-full min-h-[400px]"
            >
              {topSuppliersLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Spin size="large" />
                </div>
              ) : (
                <TopSuppliersChart data={topSuppliers || []} />
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
                ? 'You do not have permission to view purchasing analytics and charts.'
                : 'You need Admin or Accountant role to view purchasing analytics and charts.'
              }
            </Text>
          </div>
        </Card>
      )}

      {/* Recent Purchases */}
      <Card 
        title={
          <Space>
            <FileTextOutlined className="text-purple-600" />
            <span>Recent Purchases</span>
          </Space>
        }
        className="shadow-lg border-0 rounded-xl"
      >
        <RecentPurchases />
      </Card>
    </div>
  );
};

