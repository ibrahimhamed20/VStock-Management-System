import React from 'react';
import { Card, Typography, List, Tag, Space, Button } from 'antd';
import { 
  ExclamationCircleOutlined, 
  ShoppingOutlined,
  ArrowRightOutlined 
} from '@ant-design/icons';
import { useLowStockProducts } from '../hooks/useDashboard';

const { Text } = Typography;

export const LowStockAlert: React.FC = () => {
  const { data: lowStockProducts, isLoading, error } = useLowStockProducts();

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

  if (error) {
    return (
      <Card className="shadow-lg border-0 rounded-2xl border-red-200 bg-red-50">
        <div className="text-center">
          <ExclamationCircleOutlined className="text-red-500 text-2xl mb-2" />
          <Text className="text-red-600">Failed to load low stock alerts</Text>
        </div>
      </Card>
    );
  }

  if (!lowStockProducts || lowStockProducts.length === 0) {
    return (
      <Card className="shadow-lg border-0 rounded-2xl border-green-200 bg-green-50">
        <div className="text-center">
          <ShoppingOutlined className="text-green-500 text-2xl mb-2" />
          <Text className="text-green-600">All products are well stocked!</Text>
        </div>
      </Card>
    );
  }

  const getStockLevelColor = (current: number, min: number) => {
    const ratio = current / min;
    if (ratio <= 0.5) return 'error';
    if (ratio <= 0.8) return 'warning';
    return 'default';
  };

  const getStockLevelText = (current: number, min: number) => {
    const ratio = current / min;
    if (ratio <= 0.5) return 'Critical';
    if (ratio <= 0.8) return 'Low';
    return 'Warning';
  };

  return (
    <Card 
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ExclamationCircleOutlined className="text-orange-500 mr-2" />
            <span className="text-lg font-semibold">Low Stock Alerts</span>
          </div>
          <Tag color="orange" className="font-medium">
            {lowStockProducts.length} items
          </Tag>
        </div>
      }
      className="shadow-lg border-0 rounded-2xl h-full"
      extra={
        <Button 
          type="link" 
          icon={<ArrowRightOutlined />}
          onClick={() => window.location.href = '/inventory'}
          className="text-orange-500 hover:text-orange-600"
        >
          View All
        </Button>
      }
    >
      <List
        dataSource={lowStockProducts.slice(0, 5)}
        renderItem={(product) => {
          const stockLevel = getStockLevelColor(product.currentStock, product.minStock);
          const stockText = getStockLevelText(product.currentStock, product.minStock);
          
          return (
            <List.Item className="px-0 py-3 border-b border-gray-100 last:border-b-0">
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <Text className="font-medium text-gray-800 block">
                      {product.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      SKU: {product.sku}
                    </Text>
                  </div>
                  <Tag color={stockLevel} className="ml-2">
                    {stockText}
                  </Tag>
                </div>
                
                <div className="flex items-center justify-between">
                  <Space size="small">
                    <Text className="text-sm text-gray-600">Current:</Text>
                    <Text className="font-medium text-gray-800">
                      {product.currentStock}
                    </Text>
                    <Text className="text-sm text-gray-600">Min:</Text>
                    <Text className="font-medium text-gray-800">
                      {product.minStock}
                    </Text>
                  </Space>
                  
                  <div className="text-right">
                    <Text className="text-xs text-gray-400">
                      Need: {Math.max(0, product.minStock - product.currentStock)}
                    </Text>
                  </div>
                </div>
              </div>
            </List.Item>
          );
        }}
        locale={{
          emptyText: (
            <div className="text-center py-4">
              <ShoppingOutlined className="text-gray-300 text-2xl mb-2" />
              <Text className="text-gray-500">No low stock products</Text>
            </div>
          )
        }}
      />
      
      {lowStockProducts.length > 5 && (
        <div className="text-center pt-3 border-t border-gray-100">
          <Text className="text-sm text-gray-500">
            +{lowStockProducts.length - 5} more products need attention
          </Text>
        </div>
      )}
    </Card>
  );
};

