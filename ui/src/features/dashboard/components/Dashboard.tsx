import React from 'react';
import { Row, Col, Card, Typography, Progress } from 'antd';
import {
  ShoppingOutlined, DollarOutlined, UserOutlined, ShoppingCartOutlined, BarChartOutlined,
  RiseOutlined, StarOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../common/components/PageHeader';
import { useAuthUser } from '../../auth/stores/auth.store';

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthUser();

  // Mock data - replace with real API calls
  const stats = {
    totalSales: 125000,
    totalProducts: 1250,
    totalCustomers: 450,
    totalOrders: 1250,
  };

  const recentOrders = [
    { id: 1, customer: 'John Doe', amount: 150, status: 'completed', progress: 100 },
    { id: 2, customer: 'Jane Smith', amount: 200, status: 'pending', progress: 65 },
    { id: 3, customer: 'Bob Johnson', amount: 75, status: 'processing', progress: 85 },
  ];

  const topProducts = [
    { name: 'Product A', sales: 150, revenue: 15000, rating: 4.8 },
    { name: 'Product B', sales: 120, revenue: 12000, rating: 4.6 },
    { name: 'Product C', sales: 100, revenue: 10000, rating: 4.9 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'processing': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

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
                  <Text className="text-blue-100 text-sm font-medium">Total Sales</Text>
                  <div className="text-2xl font-bold mt-1">${stats.totalSales.toLocaleString()}</div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarOutlined className="text-2xl" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-blue-100 text-sm">
                <RiseOutlined className="mr-1" />
                +12.5% from last month
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
                  <div className="text-2xl font-bold mt-1">{stats.totalProducts.toLocaleString()}</div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingOutlined className="text-2xl" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-green-100 text-sm">
                <RiseOutlined className="mr-1" />
                +8.2% from last month
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
                  <div className="text-2xl font-bold mt-1">{stats.totalCustomers.toLocaleString()}</div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <UserOutlined className="text-2xl" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-purple-100 text-sm">
                <RiseOutlined className="mr-1" />
                +15.3% from last month
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg border-0 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-orange-500 to-orange-600">
            <div className="text-white">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-orange-100 text-sm font-medium">Total Orders</Text>
                  <div className="text-2xl font-bold mt-1">{stats.totalOrders.toLocaleString()}</div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingCartOutlined className="text-2xl" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-orange-100 text-sm">
                <RiseOutlined className="mr-1" />
                +22.1% from last month
              </div>
            </div>
          </Card>
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
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
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

