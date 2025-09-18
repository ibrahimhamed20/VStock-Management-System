import React from 'react';
import { Card, Row, Col, Statistic, Spin, Alert } from 'antd';
import { 
  DollarOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useSalesStats } from '../hooks';

export const SalesStats: React.FC = () => {
  const { data: stats, isLoading, error } = useSalesStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error loading sales statistics"
        description="Failed to fetch sales data. Please try again."
        type="error"
        showIcon
      />
    );
  }

  if (!stats) {
    return null;
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  const formatNumber = (num: number) => 
    new Intl.NumberFormat('en-US').format(num);

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} sm={12} md={6}>
            <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <DollarOutlined className="mr-2 text-green-600" />
                  Total Sales
                </span>
              }
              value={stats.totalSales}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#059669', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <FileTextOutlined className="mr-2 text-blue-600" />
                  Total Invoices
                </span>
              }
              value={stats.totalInvoices}
              formatter={(value) => formatNumber(Number(value))}
              valueStyle={{ color: '#2563eb', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-purple-50 to-violet-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <CheckCircleOutlined className="mr-2 text-purple-600" />
                  Paid Invoices
                </span>
              }
              value={stats.paidInvoices}
              formatter={(value) => formatNumber(Number(value))}
              valueStyle={{ color: '#7c3aed', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-orange-50 to-amber-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <ClockCircleOutlined className="mr-2 text-orange-600" />
                  Pending Invoices
                </span>
              }
              value={stats.pendingInvoices}
              formatter={(value) => formatNumber(Number(value))}
              valueStyle={{ color: '#ea580c', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Statistics */}
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-red-50 to-rose-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <ExclamationCircleOutlined className="mr-2 text-red-600" />
                  Overdue Invoices
                </span>
              }
              value={stats.overdueInvoices}
              formatter={(value) => formatNumber(Number(value))}
              valueStyle={{ color: '#dc2626', fontSize: '20px', fontWeight: 'bold' }}
            />
            <div className="mt-2 text-sm text-red-600">
              Amount: {formatCurrency(stats.overdueAmount)}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <WarningOutlined className="mr-2 text-teal-600" />
                  Avg Invoice Value
                </span>
              }
              value={stats.averageInvoiceValue}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#0d9488', fontSize: '20px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <CalendarOutlined className="mr-2 text-indigo-600" />
                  Monthly Sales
                </span>
              }
              value={stats.monthlySales}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#4f46e5', fontSize: '20px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-pink-50 to-rose-100 hover:shadow-xl transition-all duration-300 h-full min-h-[140px]">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <ShoppingCartOutlined className="mr-2 text-pink-600" />
                  Weekly Sales
                </span>
              }
              value={stats.weeklySales}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#e11d48', fontSize: '20px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
