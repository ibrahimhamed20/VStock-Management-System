import React from 'react';
import { Button, Card, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { usePermissionMatrix } from './hooks/usePermissionMatrix';
import { PermissionMatrixStats } from './components/PermissionMatrixStats';
import { PermissionMatrixTable } from './components/PermissionMatrixTable';
import { PermissionMatrixLegend } from './components/PermissionMatrixLegend';

const { Title, Text } = Typography;

export const PermissionMatrix: React.FC = () => {
    const { refetch, isLoading } = usePermissionMatrix();
    const handleRefresh = () => refetch();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto p-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <Title level={1} className="text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Permission Matrix
                    </Title>
                    <Text className="text-gray-600 text-lg">
                        Overview of roles and their associated permissions
                    </Text>
                </div>

                {/* Statistics Cards */}
                <PermissionMatrixStats />

                {/* Permission Matrix */}
                <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <Title level={3} className="text-gray-800 mb-2">Role-Permission Matrix</Title>
                            <Text className="text-gray-600">Visual representation of which roles have access to which permissions</Text>
                        </div>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            size="large"
                            className="h-12 rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-500 transition-all duration-200"
                            loading={isLoading}
                        >
                            Refresh Matrix
                        </Button>
                    </div>

                    <PermissionMatrixTable />
                </Card>

                {/* Legend */}
                <PermissionMatrixLegend />
            </div>
        </div>
    );
};

// Add custom styles for the permission matrix table
const styles = `
  .permission-matrix-table .ant-table-thead > tr > th {
    background: #f8fafc;
    border-bottom: 2px solid #e2e8f0;
    font-weight: 600;
    text-align: center;
    padding: 12px 8px;
    white-space: nowrap;
  }
  
  .permission-matrix-table .ant-table-tbody > tr > td {
    padding: 12px 8px;
    text-align: center;
    border-right: 1px solid #f0f0f0;
    vertical-align: middle;
  }
  
  .permission-matrix-table .ant-table-tbody > tr:hover > td {
    background: #f0f9ff;
  }
  
  .permission-matrix-table .ant-table-tbody > tr > td:first-child {
    text-align: left;
    background: #fafbfc;
    font-weight: 500;
  }
  
  .permission-matrix-table .ant-table-tbody > tr:hover > td:first-child {
    background: #f0f9ff;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}
