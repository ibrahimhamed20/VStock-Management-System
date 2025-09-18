import React from 'react';
import { Row, Col, Card, Typography, Progress, Alert, Spin } from 'antd';
import {
  ShoppingOutlined, DollarOutlined, UserOutlined, ShoppingCartOutlined, BarChartOutlined,
  RiseOutlined, StarOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../common/components/PageHeader';
import { useAuthUser } from '../../auth/stores/auth.store';
import { useDashboardData } from '../hooks/useDashboard';
import { SystemStatusCard } from './SystemStatusCard';
import { LowStockAlert } from './LowStockAlert';
import { PendingInvoicesCard } from './PendingInvoicesCard';

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthUser();
  const { 
    stats, 
    recentOrders, 
    topProducts, 
    isLoading, 
    hasError, 
    refetch 
  } = useDashboardData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'processing': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <PageHeader
          title={t('dashboard.title')}
          subtitle={t('dashboard.subtitle')}
          breadcrumbs={[
            { label: t('navigation.home'), path: '/' },
            { label: t('navigation.dashboard'), path: '/dashboard' },
          ]}
        />
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <PageHeader
          title={t('dashboard.title')}
          subtitle={t('dashboard.subtitle')}
          breadcrumbs={[
            { label: t('navigation.home'), path: '/' },
            { label: t('navigation.dashboard'), path: '/dashboard' },
          ]}
        />
        <Alert
          message="Error Loading Dashboard"
          description="There was an error loading the dashboard data. Please try refreshing the page."
          type="error"
          showIcon
          action={
            <button 
              onClick={refetch}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        breadcrumbs={[
          { label: t('navigation.home'), path: '/' },
          { label: t('navigation.dashboard'), path: '/dashboard' },
        ]}
        actions={
          <button
            onClick={refetch}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <ReloadOutlined className="mr-2" />
            Refresh
          </button>
        }
      />

      {/* Welcome Message */}
      {user && (
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-xl">
          <div className="text-center text-white">
            <Title level={3} className="text-white mb-2">
              Welcome back, {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}! 👋
            </Title>
            <Text className="text-blue-100 text-lg">
              Here's what's happening with your store today.
            </Text>
          </div>
        </Card>
      )}

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg border-0 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-500 to-blue-600">
            <div className="text-white">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-blue-100 text-sm font-medium">Total Revenue</Text>
                  <div className="text-2xl font-bold mt-1">
                    ${stats?.totalRevenue?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarOutlined className="text-2xl" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-blue-100 text-sm">
                <RiseOutlined className="mr-1" />
                Net Income: ${stats?.netIncome?.toLocaleString() || '0'}
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg border-0 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-green-500 to-green-600">
            <div className="text-white">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-green-100 text-sm font-medium">Total Products</Text>
                  <div className="text-2xl font-bold mt-1">
                    {stats?.totalProducts?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingOutlined className="text-2xl" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-green-100 text-sm">
                <RiseOutlined className="mr-1" />
                Low Stock: {stats?.lowStockProducts || '0'}
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg border-0 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-500 to-purple-600">
            <div className="text-white">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-purple-100 text-sm font-medium">Total Customers</Text>
                  <div className="text-2xl font-bold mt-1">
                    {stats?.totalCustomers?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <UserOutlined className="text-2xl" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-purple-100 text-sm">
                <RiseOutlined className="mr-1" />
                Active Orders: {stats?.totalOrders || '0'}
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg border-0 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-orange-500 to-orange-600">
            <div className="text-white">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-orange-100 text-sm font-medium">Pending Invoices</Text>
                  <div className="text-2xl font-bold mt-1">
                    {stats?.pendingInvoices || '0'}
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingCartOutlined className="text-2xl" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-orange-100 text-sm">
                <RiseOutlined className="mr-1" />
                Pending Payments: {stats?.pendingPayments || '0'}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* System Status and Alerts Row */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} lg={8}>
          <SystemStatusCard />
        </Col>
        <Col xs={24} lg={8}>
          <LowStockAlert />
        </Col>
        <Col xs={24} lg={8}>
          <PendingInvoicesCard />
        </Col>
      </Row>

      {/* Charts and Tables Row */}
      <Row gutter={[24, 24]} className="mb-8">
        {/* Recent Orders */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center">
                <BarChartOutlined className="text-blue-500 mr-2" />
                <span className="text-lg font-semibold">Recent Orders</span>
              </div>
            } 
            className="shadow-lg border-0 rounded-2xl h-full"
          >
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => {
                  const statusColors = getStatusColor(order.status);
                  return (
                    <div key={order.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold text-gray-800">{order.customer}</div>
                          <div className="text-sm text-gray-500">Order #{order.id}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-gray-800">${order.amount}</div>
                          <div className={`text-xs px-3 py-1 rounded-full ${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}>
                            {order.status}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">Progress</div>
                        <Progress 
                          percent={order.progress} 
                          size="small" 
                          strokeColor={order.status === 'completed' ? '#10b981' : order.status === 'pending' ? '#f59e0b' : '#3b82f6'}
                          showInfo={false}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent orders found
              </div>
            )}
          </Card>
        </Col>

        {/* Top Products */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center">
                <StarOutlined className="text-yellow-500 mr-2" />
                <span className="text-lg font-semibold">Top Products</span>
              </div>
            } 
            className="shadow-lg border-0 rounded-2xl h-full"
          >
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.sku} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold mr-4">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.sales} units sold</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-800">${product.revenue.toLocaleString()}</div>
                        <div className="flex items-center text-sm text-yellow-600">
                          <StarOutlined className="mr-1" />
                          {product.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No product data available
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card 
            title={
              <div className="flex items-center">
                <RiseOutlined className="text-green-500 mr-2" />
                <span className="text-lg font-semibold">Quick Actions</span>
              </div>
            }
            className="shadow-lg border-0 rounded-2xl"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  className="text-center cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200"
                  onClick={() => window.location.href = '/inventory'}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <ShoppingOutlined className="text-2xl text-white" />
                  </div>
                  <div className="font-semibold text-gray-800">Manage Inventory</div>
                  <div className="text-sm text-gray-600 mt-1">Add, edit, and track products</div>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Card 
                  className="text-center cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200"
                  onClick={() => window.location.href = '/sales'}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <DollarOutlined className="text-2xl text-white" />
                  </div>
                  <div className="font-semibold text-gray-800">Create Sale</div>
                  <div className="text-sm text-gray-600 mt-1">Generate new invoices</div>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Card 
                  className="text-center cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200"
                  onClick={() => window.location.href = '/purchasing'}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <ShoppingCartOutlined className="text-2xl text-white" />
                  </div>
                  <div className="font-semibold text-gray-800">New Purchase</div>
                  <div className="text-sm text-gray-600 mt-1">Create purchase orders</div>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Card 
                  className="text-center cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200"
                  onClick={() => window.location.href = '/reports'}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <BarChartOutlined className="text-2xl text-white" />
                  </div>
                  <div className="font-semibold text-gray-800">View Reports</div>
                  <div className="text-sm text-gray-600 mt-1">Analytics and insights</div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

