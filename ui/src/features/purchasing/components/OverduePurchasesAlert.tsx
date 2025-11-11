import React from 'react';
import { Alert, List, Button, Space, Typography, Tag } from 'antd';
import { ExclamationCircleOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { type Purchase } from '../types';
import { formatCurrency, formatDate } from '../../common/utils';

const { Text, Title } = Typography;

interface OverduePurchasesAlertProps {
  purchases: Purchase[];
}

export const OverduePurchasesAlert: React.FC<OverduePurchasesAlertProps> = ({ purchases }) => {
  const totalOverdueAmount = purchases.reduce((sum, purchase) => sum + purchase.remainingAmount, 0);

  return (
    <Alert
      message={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ExclamationCircleOutlined className="text-red-600 mr-2" />
            <Title level={5} className="mb-0 text-red-600">
              Overdue Purchases Alert
            </Title>
          </div>
          <div className="text-right">
            <Text strong className="text-red-600">
              {purchases.length} purchases overdue
            </Text>
            <br />
            <Text type="secondary">
              Total: {formatCurrency(totalOverdueAmount)}
            </Text>
          </div>
        </div>
      }
      description={
        <div className="mt-3">
          <List
            size="small"
            dataSource={purchases.slice(0, 3)}
            renderItem={(purchase) => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    size="small"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </Button>,
                  <Button
                    type="text"
                    icon={<CheckCircleOutlined />}
                    size="small"
                    className="text-green-600 hover:text-green-800"
                  >
                    Receive
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{purchase.purchaseNumber}</Text>
                      <Tag color="red">Overdue</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <div>{purchase.supplierName}</div>
                      <div className="text-sm text-gray-500">
                        Expected: {formatDate(purchase.expectedDeliveryDate)} • Amount: {formatCurrency(purchase.remainingAmount)}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          {purchases.length > 3 && (
            <div className="mt-2 text-center">
              <Text type="secondary">
                And {purchases.length - 3} more overdue purchases...
              </Text>
            </div>
          )}
        </div>
      }
      type="warning"
      showIcon={false}
      className="border-red-200 bg-red-50"
    />
  );
};

