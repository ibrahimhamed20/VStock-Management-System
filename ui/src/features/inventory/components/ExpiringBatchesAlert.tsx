import React from 'react';
import { Alert, List, Typography, Button, Space, Tag } from 'antd';
import { ClockCircleOutlined, EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useStockAlerts } from '../hooks/useInventory';
import type { BatchExpiry } from '../types/inventory.types';

const { Text, Title } = Typography;

interface ExpiringBatchesAlertProps {
  onViewProduct?: (batch: BatchExpiry) => void;
  onReorder?: (batch: BatchExpiry) => void;
  maxItems?: number;
}

export const ExpiringBatchesAlert: React.FC<ExpiringBatchesAlertProps> = ({
  onViewProduct,
  onReorder,
  maxItems = 5
}) => {
  const { data: stockAlerts, isLoading, error } = useStockAlerts();

  if (isLoading) {
    return (
      <Alert
        message="Loading expiring batches..."
        type="info"
        showIcon
        className="mb-6"
      />
    );
  }

  if (error) {
    return (
      <Alert
        message="Error loading expiring batches"
        description="Failed to load batch expiry information"
        type="error"
        showIcon
        className="mb-6"
      />
    );
  }

  if (!stockAlerts || stockAlerts.expiringCount === 0) {
    return (
      <Alert
        message="No expiring batches"
        description="All batches are within their expiry dates"
        type="success"
        showIcon
        className="mb-6"
      />
    );
  }

  const expiringItems = stockAlerts.expiringBatches.slice(0, maxItems);

  const getExpiryColor = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 0) return 'red';
    if (daysUntilExpiry <= 3) return 'orange';
    if (daysUntilExpiry <= 7) return 'yellow';
    return 'green';
  };

  const getExpiryText = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 0) return 'Expired';
    if (daysUntilExpiry === 1) return '1 day';
    return `${daysUntilExpiry} days`;
  };

  return (
    <Alert
      message={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClockCircleOutlined className="text-yellow-500" />
            <Title level={5} className="mb-0">
              Expiring Batches ({stockAlerts.expiringCount} items)
            </Title>
          </div>
          {stockAlerts.expiringCount > maxItems && (
            <Text type="secondary" className="text-sm">
              Showing {maxItems} of {stockAlerts.expiringCount}
            </Text>
          )}
        </div>
      }
      description={
        <List
          size="small"
          dataSource={expiringItems}
          renderItem={(item) => (
            <List.Item
              className="!px-0 !py-2"
              actions={[
                <Button
                  key="view"
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => onViewProduct?.(item)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  View
                </Button>,
                <Button
                  key="reorder"
                  type="text"
                  size="small"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => onReorder?.(item)}
                  className="text-green-600 hover:text-green-700"
                >
                  Reorder
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center space-x-2">
                    <Text strong className="text-sm">{item.productName}</Text>
                    <Tag color="blue" className="text-xs">
                      {item.batchId}
                    </Tag>
                    <Tag 
                      color={getExpiryColor(item.daysUntilExpiry)} 
                      className="text-xs"
                    >
                      {getExpiryText(item.daysUntilExpiry)}
                    </Tag>
                  </div>
                }
                description={
                  <Space size="small" className="text-xs">
                    <Text type="secondary">
                      Qty: <Text strong>{item.remainingQuantity}</Text>
                    </Text>
                    <Text type="secondary">•</Text>
                    <Text type="secondary">
                      Expires: {new Date(item.expiryDate).toLocaleDateString()}
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
