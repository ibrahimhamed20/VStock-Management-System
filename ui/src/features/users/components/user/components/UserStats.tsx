import React from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { 
  UserOutlined, 
  SafetyCertificateOutlined, 
  CrownOutlined, 
  StopOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { useUserStats } from '../hooks/useUserStats';

export const UserStats: React.FC = () => {
  const { stats, isLoading } = useUserStats();

  if (isLoading) {
    return (
      <Row gutter={[16, 16]} className="mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <Col xs={24} sm={12} md={8} lg={4} xl={4} key={i}>
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
      <Col xs={24} sm={12} md={8} lg={4} xl={4}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic 
            title="Total Users" 
            value={stats.totalUsers} 
            prefix={<UserOutlined className="text-blue-500" />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={4} xl={4}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic 
            title="Active Users" 
            value={stats.activeUsers} 
            prefix={<SafetyCertificateOutlined className="text-green-500" />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={4} xl={4}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic 
            title="Admin Users" 
            value={stats.adminUsers} 
            prefix={<CrownOutlined className="text-red-500" />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={4} xl={4}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic 
            title="Blocked Users" 
            value={stats.blockedUsers} 
            prefix={<StopOutlined className="text-orange-500" />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={4} xl={4}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic 
            title="Pending Users" 
            value={stats.pendingUsers} 
            prefix={<ClockCircleOutlined className="text-yellow-500" />}
            className="text-center"
          />
        </Card>
      </Col>
    </Row>
  );
};
