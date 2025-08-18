import React from 'react';
import { Card, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { usePermissionMatrix } from '../hooks/usePermissionMatrix';

const { Text } = Typography;

export const PermissionMatrixLegend: React.FC = () => {
  const { data: permissionMatrix } = usePermissionMatrix();

  if (!permissionMatrix) {
    return null;
  }

  return (
    <Card className="mt-6 shadow-lg border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircleOutlined className="text-white text-xs" />
          </div>
          <Text className="text-sm text-gray-600">Permission Granted</Text>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <Text className="text-sm text-gray-600">Permission Not Granted</Text>
        </div>
      </div>
    </Card>
  );
};
