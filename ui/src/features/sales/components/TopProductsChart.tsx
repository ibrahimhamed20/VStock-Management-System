import React from 'react';
import { List, Typography, Progress, Space } from 'antd';
import { DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import type { TopProduct } from '../types';
import { formatCurrency, formatNumber } from '../../common/utils';

const { Text } = Typography;

interface TopProductsChartProps {
  data: TopProduct[];
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ShoppingCartOutlined className="text-4xl mb-2" />
        <div>No product data available</div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(item => item.revenue));

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
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <Text strong className="text-gray-900">
                      {item.productName}
                    </Text>
                    <div className="text-sm text-gray-500">
                      {formatNumber(item.quantity)} units sold
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Text strong className="text-green-600 text-lg">
                    {formatCurrency(item.revenue)}
                  </Text>
                  <div className="text-sm text-gray-500">
                    {item.percentage?.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <Progress
                percent={(item.revenue / maxRevenue) * 100}
                showInfo={false}
                strokeColor={{
                  '0%': '#10b981',
                  '100%': '#059669',
                }}
                className="mb-2"
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                <Space>
                  <DollarOutlined />
                  <span>Revenue: {formatCurrency(item.revenue)}</span>
                </Space>
                <Space>
                  <ShoppingCartOutlined />
                  <span>Units: {formatNumber(item.quantity)}</span>
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
