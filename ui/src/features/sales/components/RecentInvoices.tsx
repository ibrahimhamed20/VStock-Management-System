import React from 'react';
import { Table, Tag, Button, Space, Typography, Spin, Alert } from 'antd';
import { EyeOutlined, EditOutlined, DollarOutlined } from '@ant-design/icons';
import { useInvoices } from '../hooks';
import { type Invoice, PaymentStatus } from '../types';
import { formatCurrency, formatDate } from '../../common/utils';

const { Text } = Typography;

const getStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PAID:
      return 'success';
    case PaymentStatus.PENDING:
      return 'warning';
    case PaymentStatus.PARTIAL:
      return 'processing';
    case PaymentStatus.OVERDUE:
      return 'error';
    case PaymentStatus.CANCELLED:
      return 'default';
    default:
      return 'default';
  }
};

const getStatusText = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PAID:
      return 'Paid';
    case PaymentStatus.PENDING:
      return 'Pending';
    case PaymentStatus.PARTIAL:
      return 'Partial';
    case PaymentStatus.OVERDUE:
      return 'Overdue';
    case PaymentStatus.CANCELLED:
      return 'Cancelled';
    default:
      return status;
  }
};

export const RecentInvoices: React.FC = () => {
  const { data: invoices, isLoading, error } = useInvoices();

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
        message="Error loading invoices"
        description="Failed to fetch recent invoices."
        type="error"
        showIcon
      />
    );
  }

  const recentInvoices = invoices?.slice(0, 10) || [];

  const columns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text: string) => (
        <Text strong className="text-blue-600">
          {text}
        </Text>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
      render: (text: string, record: Invoice) => (
        <div>
          <div className="font-medium">{text}</div>
          <Text type="secondary" className="text-xs">
            {record.clientEmail}
          </Text>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <Text strong className="text-green-600">
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: PaymentStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: Date) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Invoice) => ( // eslint-disable-line
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
          {record.paymentStatus === PaymentStatus.PENDING && (
            <Button
              type="text"
              icon={<DollarOutlined />}
              size="small"
              className="text-purple-600 hover:text-purple-800"
            >
              Pay
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={recentInvoices}
      rowKey="id"
      pagination={false}
      size="small"
      className="rounded-lg"
    />
  );
};
