import React from 'react';
import { Alert, List, Button, Space, Typography, Tag } from 'antd';
import { ExclamationCircleOutlined, EyeOutlined, DollarOutlined } from '@ant-design/icons';
import { type Invoice } from '../types';
import { formatCurrency, formatDate } from '../../common/utils';

const { Text, Title } = Typography;

interface OverdueInvoicesAlertProps {
  invoices: Invoice[];
}

export const OverdueInvoicesAlert: React.FC<OverdueInvoicesAlertProps> = ({ invoices }) => {
  const totalOverdueAmount = invoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0);

  return (
    <Alert
      message={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ExclamationCircleOutlined className="text-red-600 mr-2" />
            <Title level={5} className="mb-0 text-red-600">
              Overdue Invoices Alert
            </Title>
          </div>
          <div className="text-right">
            <Text strong className="text-red-600">
              {invoices.length} invoices overdue
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
            dataSource={invoices.slice(0, 3)}
            renderItem={(invoice) => (
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
                    icon={<DollarOutlined />}
                    size="small"
                    className="text-green-600 hover:text-green-800"
                  >
                    Pay
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{invoice.invoiceNumber}</Text>
                      <Tag color="red">Overdue</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <div>{invoice.clientName}</div>
                      <div className="text-sm text-gray-500">
                        Due: {formatDate(invoice.dueDate)} • Amount: {formatCurrency(invoice.remainingAmount)}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          {invoices.length > 3 && (
            <div className="mt-2 text-center">
              <Text type="secondary">
                And {invoices.length - 3} more overdue invoices...
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
