import React from 'react';
import { Card, Typography, Progress, Space, Tag } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  ClockCircleOutlined,
  DatabaseOutlined 
} from '@ant-design/icons';
import { useSystemStatus } from '../hooks/useDashboard';

const { Text } = Typography;

export const SystemStatusCard: React.FC = () => {
  const { data: systemStatus, isLoading, error } = useSystemStatus();

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 rounded-2xl">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !systemStatus) {
    return (
      <Card className="shadow-lg border-0 rounded-2xl border-red-200 bg-red-50">
        <div className="text-center">
          <ExclamationCircleOutlined className="text-red-500 text-2xl mb-2" />
          <Text className="text-red-600">Failed to load system status</Text>
        </div>
      </Card>
    );
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'down':
        return 'error';
      default:
        return 'default';
    }
  };

  const memoryPercentage = systemStatus.memory.percentage;
  const getMemoryColor = (percentage: number) => {
    if (percentage < 60) return '#52c41a';
    if (percentage < 80) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <Card 
      title={
        <div className="flex items-center">
          <CheckCircleOutlined className="text-green-500 mr-2" />
          <span className="text-lg font-semibold">System Status</span>
        </div>
      }
      className="shadow-lg border-0 rounded-2xl h-full"
    >
      <Space direction="vertical" size="large" className="w-full">
        {/* Status */}
        <div className="flex items-center justify-between">
          <Text className="text-gray-600">Status</Text>
          <Tag color={getStatusColor(systemStatus.status)} className="font-medium">
            {systemStatus.status}
          </Tag>
        </div>

        {/* Uptime */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ClockCircleOutlined className="text-blue-500 mr-2" />
            <Text className="text-gray-600">Uptime</Text>
          </div>
          <Text className="font-medium">{formatUptime(systemStatus.uptime)}</Text>
        </div>

        {/* Memory Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <DatabaseOutlined className="text-purple-500 mr-2" />
              <Text className="text-gray-600">Memory Usage</Text>
            </div>
            <Text className="font-medium">
              {systemStatus.memory.used}MB / {systemStatus.memory.total}MB
            </Text>
          </div>
          <Progress 
            percent={memoryPercentage} 
            strokeColor={getMemoryColor(memoryPercentage)}
            showInfo={false}
            size="small"
          />
          <div className="text-right mt-1">
            <Text className="text-xs text-gray-500">
              {memoryPercentage.toFixed(1)}%
            </Text>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center pt-2 border-t border-gray-100">
          <Text className="text-xs text-gray-400">
            Last updated: {new Date(systemStatus.timestamp).toLocaleTimeString()}
          </Text>
        </div>
      </Space>
    </Card>
  );
};
