import React from 'react';
import { Table, Tag, Button, Space, Typography, Spin, Alert } from 'antd';
import { EyeOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { usePurchases } from '../hooks';
import { type Purchase, PurchaseStatus } from '../types';
import { formatCurrency, formatDate } from '../../common/utils';

const { Text } = Typography;

const getStatusColor = (status: PurchaseStatus) => {
  switch (status) {
    case PurchaseStatus.RECEIVED:
      return 'success';
    case PurchaseStatus.PENDING:
    case PurchaseStatus.DRAFT:
      return 'default';
    case PurchaseStatus.APPROVED:
      return 'processing';
    case PurchaseStatus.ORDERED:
      return 'warning';
    case PurchaseStatus.CANCELLED:
      return 'error';
    default:
      return 'default';
  }
};

const getStatusText = (status: PurchaseStatus) => {
  switch (status) {
    case PurchaseStatus.DRAFT:
      return 'Draft';
    case PurchaseStatus.PENDING:
      return 'Pending';
    case PurchaseStatus.APPROVED:
      return 'Approved';
    case PurchaseStatus.ORDERED:
      return 'Ordered';
    case PurchaseStatus.RECEIVED:
      return 'Received';
    case PurchaseStatus.CANCELLED:
      return 'Cancelled';
    default:
      return status;
  }
};

export const RecentPurchases: React.FC = () => {
  const { data: purchases, isLoading, error } = usePurchases();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error loading purchases"
        description="Failed to fetch recent purchases."
        type="error"
        showIcon
      />
    );
  }

  const recentPurchases = purchases?.slice(0, 10) || [];

  const columns = [
    {
      title: 'Purchase #',
      dataIndex: 'purchaseNumber',
      key: 'purchaseNumber',
      render: (text: string) => (
        <Text strong className="text-blue-600">
          {text}
        </Text>
      ),
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (text: string, record: Purchase) => (
        <div>
          <div className="font-medium">{text}</div>
          <Text type="secondary" className="text-xs">
            {record.supplierEmail}
          </Text>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <Text strong className="text-blue-600">
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'purchaseStatus',
      key: 'purchaseStatus',
      render: (status: PurchaseStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Expected Delivery',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      render: (date: Date) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Purchase) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            className="text-blue-600 hover:text-blue-800"
          >
            View
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            className="text-green-600 hover:text-green-800"
          >
            Edit
          </Button>
          {record.purchaseStatus === PurchaseStatus.APPROVED && (
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              size="small"
              className="text-purple-600 hover:text-purple-800"
            >
              Receive
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={recentPurchases}
      rowKey="id"
      pagination={false}
      size="small"
      className="rounded-lg"
    />
  );
};

