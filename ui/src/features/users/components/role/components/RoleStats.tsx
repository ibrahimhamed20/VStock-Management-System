import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { TeamOutlined, CrownOutlined, KeyOutlined } from '@ant-design/icons';
import { useRolesStats } from '../hooks/useRoles';
import { usePermissions } from '../hooks/usePermissions';

export const RoleStats: React.FC = () => {
  const rolesStats = useRolesStats();
  const { data: permissions } = usePermissions();

  if (!rolesStats) return null;

  return (
    <Row gutter={16} className="mb-8">
      <Col span={6}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic
            title="Total Roles"
            value={rolesStats.totalRoles}
            prefix={<TeamOutlined className="text-blue-500" />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic
            title="Admin Roles"
            value={rolesStats.adminRoles}
            prefix={<CrownOutlined className="text-red-500" />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic
            title="Custom Roles"
            value={rolesStats.customRoles}
            prefix={<TeamOutlined className="text-green-500" />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic
            title="Total Permissions"
            value={permissions?.length || 0}
            prefix={<KeyOutlined className="text-purple-500" />}
            className="text-center"
          />
        </Card>
      </Col>
    </Row>
  );
};
