import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { 
  UserOutlined, 
  KeyOutlined, 
  CheckCircleOutlined, 
  DatabaseOutlined 
} from '@ant-design/icons';
import { usePermissionMatrixStats } from '../hooks/usePermissionMatrix';

export const PermissionMatrixStats: React.FC = () => {
  const stats = usePermissionMatrixStats();

  if (!stats) {
    return null;
  }

  return (
    <Row gutter={16} className="mb-8">
      <Col span={6}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic
            title="Total Roles"
            value={stats.totalRoles}
            prefix={<UserOutlined className="text-blue-500" />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic
            title="Total Permissions"
            value={stats.totalPermissions}
            prefix={<KeyOutlined className="text-purple-500" />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic
            title="Total Assignments"
            value={stats.totalAssignments}
            prefix={<CheckCircleOutlined className="text-green-500" />}
            className="text-center"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <Statistic
            title="Avg Permissions/Role"
            value={stats.averagePermissionsPerRole}
            prefix={<DatabaseOutlined className="text-orange-500" />}
            className="text-center"
          />
        </Card>
      </Col>
    </Row>
  );
};
