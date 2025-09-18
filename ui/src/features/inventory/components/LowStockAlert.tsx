import React from 'react';
import { Alert, List, Typography, Button, Space, Tag } from 'antd';
import { ExclamationCircleOutlined, ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useStockAlerts } from '../hooks/useInventory';
import type { Product } from '../types/inventory.types';

const { Text, Title } = Typography;

interface LowStockAlertProps {
  onViewProduct?: (product: Product) => void;
  onReorder?: (product: Product) => void;
  maxItems?: number;
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({
  onViewProduct,
  onReorder,
  maxItems = 5
}) => {
  const { data: stockAlerts, isLoading, error } = useStockAlerts();

  if (isLoading) {
    return (
      <Alert
        message="Loading stock alerts..."
        type="info"
        showIcon
        className="mb-6"
      />
    );
  }

  if (error) {
    return (
      <Alert
        message="Error loading stock alerts"
        description="Failed to load low stock information"
        type="error"
        showIcon
        className="mb-6"
      />
    );
  }

  if (!stockAlerts || stockAlerts.lowStockCount === 0) {
    return (
      <Alert
        message="All products are well stocked"
        description="No low stock alerts at this time"
        type="success"
        showIcon
        className="mb-6"
      />
    );
  }

  const lowStockItems = stockAlerts.lowStockProducts.slice(0, maxItems);

  return (
    <Alert
      message={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ExclamationCircleOutlined className="text-orange-500" />
            <Title level={5} className="mb-0">
              Low Stock Alert ({stockAlerts.lowStockCount} items)
            </Title>
          </div>
          {stockAlerts.lowStockCount > maxItems && (
            <Text type="secondary" className="text-sm">
              Showing {maxItems} of {stockAlerts.lowStockCount}
            </Text>
          )}
        </div>
      }
      description={
        <List
          size="small"
          dataSource={lowStockItems}
          renderItem={(item) => (
            <List.Item
              className="!px-0 !py-2"
              actions={[
                <Button
                  key="view"
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => onViewProduct?.(item as any)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  View
                </Button>,
                <Button
                  key="reorder"
                  type="text"
                  size="small"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => onReorder?.(item as any)}
                  className="text-green-600 hover:text-green-700"
                >
                  Reorder
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center space-x-2">
                    <Text strong className="text-sm">{item.name}</Text>
                    <Tag color="orange" className="text-xs">
                      {item.sku}
                    </Tag>
                  </div>
                }
                description={
                  <Space size="small" className="text-xs">
                    <Text type="secondary">
                      Current: <Text strong className="text-orange-600">{item.currentStock}</Text>
                    </Text>
                    <Text type="secondary">•</Text>
                    <Text type="secondary">
                      Min: <Text strong>{item.minStock}</Text>
                    </Text>
                    <Text type="secondary">•</Text>
                    <Text type="secondary" className="text-red-600">
                      Deficit: {item.deficit}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      }
      type="warning"
      showIcon={false}
      className="mb-6"
    />
  );
};
