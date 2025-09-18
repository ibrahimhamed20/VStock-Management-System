import React from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { 
  ShoppingOutlined, 
  DollarOutlined, 
  ExclamationCircleOutlined, 
  StopOutlined,
  ClockCircleOutlined,
  TagsOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useInventoryStats } from '../hooks/useInventoryStats';

export const InventoryStats: React.FC = () => {
  const { stats, isLoading } = useInventoryStats();

  if (isLoading) {
    return (
      <Row gutter={[16, 16]} className="mb-8">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Col xs={24} sm={12} md={8} lg={6} xl={6} key={i}>
            <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
              <div className="text-center">
                <Spin size="large" />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]} className="mb-8">
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic 
            title="Total Products" 
            value={stats.totalProducts} 
            prefix={<ShoppingOutlined className="text-blue-500" />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic 
            title="Stock Value" 
            value={stats.totalStockValue} 
            prefix={<DollarOutlined className="text-green-500" />}
            precision={2}
            className="text-center"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic 
            title="Low Stock" 
            value={stats.lowStockProducts} 
            prefix={<ExclamationCircleOutlined className="text-orange-500" />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic 
            title="Out of Stock" 
            value={stats.outOfStockProducts} 
            prefix={<StopOutlined className="text-red-500" />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic 
            title="Expiring Batches" 
            value={stats.expiringBatches} 
            prefix={<ClockCircleOutlined className="text-yellow-500" />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic 
            title="Categories" 
            value={stats.totalCategories} 
            prefix={<TagsOutlined className="text-purple-500" />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic 
            title="Suppliers" 
            value={stats.totalSuppliers} 
            prefix={<TeamOutlined className="text-indigo-500" />}
            className="text-center"
          />
        </Card>
      </Col>
    </Row>
  );
};
