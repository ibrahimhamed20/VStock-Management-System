import React from 'react';
import { List, Typography, Progress, Space } from 'antd';
import { DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import type { TopSupplier } from '../types';
import { formatCurrency, formatNumber } from '../../common/utils';

const { Text } = Typography;

interface TopSuppliersChartProps {
  data: TopSupplier[];
}

export const TopSuppliersChart: React.FC<TopSuppliersChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ShoppingCartOutlined className="text-4xl mb-2" />
        <div>No supplier data available</div>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map(item => item.totalAmount));

  return (
    <div className="h-64 overflow-y-auto">
      <div className="space-y-4">
        <List
          dataSource={data}
          renderItem={(item, index) => (
            <List.Item className="px-0">
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <Text strong className="text-gray-900">
                        {item.supplierName}
                      </Text>
                      <div className="text-sm text-gray-500">
                        {formatNumber(item.purchases)} orders
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text strong className="text-blue-600 text-lg">
                      {formatCurrency(item.totalAmount)}
                    </Text>
                    <div className="text-sm text-gray-500">
                      {item.percentage?.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <Progress
                  percent={(item.totalAmount / maxAmount) * 100}
                  showInfo={false}
                  strokeColor={{
                    '0%': '#3b82f6',
                    '100%': '#2563eb',
                  }}
                  className="mb-2"
                />
                
                <div className="flex justify-between text-xs text-gray-500">
                  <Space>
                    <DollarOutlined />
                    <span>Total: {formatCurrency(item.totalAmount)}</span>
                  </Space>
                  <Space>
                    <ShoppingCartOutlined />
                    <span>Orders: {formatNumber(item.purchases)}</span>
                  </Space>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

