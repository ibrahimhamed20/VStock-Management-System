import React, { useState } from 'react';
import dayjs from 'dayjs';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  DatePicker, 
  Tag, 
  Typography, 
  Row, 
  Col,
  Tooltip,
  Popconfirm,
  message,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CopyOutlined,
  DollarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useInvoices, useInvoiceMutations } from '../hooks';
import type { Invoice, InvoiceFilters } from '../types';
import { PaymentStatus } from '../types';
import { formatCurrency, formatDate } from '../../common/utils';
import { InvoiceModal } from '../components/InvoiceModal';
import { InvoiceDetailsModal } from '../components/InvoiceDetailsModal';
import { PrintInvoice } from '../../core/components/PrintInvoice';
import { useSettings } from '../../settings/hooks';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const InvoiceManagementPage: React.FC = () => {
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const { data: settings } = useSettings();

  const { data: invoices, isLoading, error, refetch } = useInvoices(filters);
  const { deleteInvoice, cancelInvoice, markInvoiceOverdue } = useInvoiceMutations();

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setIsModalVisible(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsModalVisible(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsModalVisible(true);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await deleteInvoice.mutateAsync(invoiceId);
      message.success('Invoice deleted successfully');
      refetch();
    } catch {
      message.error('Failed to delete invoice');
    }
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    try {
      await cancelInvoice.mutateAsync(invoiceId);
      message.success('Invoice cancelled successfully');
      refetch();
    } catch {
      message.error('Failed to cancel invoice');
    }
  };

  const handleMarkOverdue = async (invoiceId: string) => {
    try {
      await markInvoiceOverdue.mutateAsync(invoiceId);
      message.success('Invoice marked as overdue');
      refetch();
    } catch {
      message.error('Failed to mark invoice as overdue');
    }
  };

  const getStatusTag = (status: PaymentStatus) => {
    const statusConfig = {
      [PaymentStatus.PAID]: { color: 'green', text: 'Paid' },
      [PaymentStatus.PENDING]: { color: 'orange', text: 'Pending' },
      [PaymentStatus.PARTIAL]: { color: 'blue', text: 'Partial' },
      [PaymentStatus.OVERDUE]: { color: 'red', text: 'Overdue' },
      [PaymentStatus.CANCELLED]: { color: 'gray', text: 'Cancelled' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 120,
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
      width: 200,
      render: (text: string, record: Invoice) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-sm">
            {record.clientEmail}
          </Text>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right' as const,
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
      width: 100,
      render: (status: PaymentStatus) => getStatusTag(status),
    },
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: Invoice) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewInvoice(record)}
            />
          </Tooltip>
          
          {record.paymentStatus !== PaymentStatus.CANCELLED && (
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEditInvoice(record)}
              />
            </Tooltip>
          )}

          {record.paymentStatus === PaymentStatus.PENDING && (
            <Tooltip title="Mark Overdue">
              <Button
                type="text"
                icon={<DollarOutlined />}
                onClick={() => handleMarkOverdue(record.id)}
              />
            </Tooltip>
          )}

          {record.paymentStatus === PaymentStatus.PENDING && (
            <Tooltip title="Cancel">
              <Popconfirm
                title="Are you sure you want to cancel this invoice?"
                onConfirm={() => handleCancelInvoice(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          )}

          {record.paymentStatus === PaymentStatus.CANCELLED && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this invoice? This action cannot be undone."
                onConfirm={() => handleDeleteInvoice(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          )}

          <Tooltip title="Duplicate">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => {
                // TODO: Implement duplicate functionality
                message.info('Duplicate functionality coming soon');
              }}
            />
          </Tooltip>

          <Tooltip title="Print">
            <PrintInvoice invoice={record} settings={settings} buttonType="text" showText={false} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <Text type="danger">Failed to load invoices. Please try again.</Text>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="text-gray-900 mb-2">
            Invoice Management
          </Title>
          <Text className="text-gray-600 text-lg">
            Manage invoices, track payments, and monitor invoice status
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateInvoice}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search invoices..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Col>
          
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Status"
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              className="w-full"
            >
              <Select.Option value={PaymentStatus.PAID}>Paid</Select.Option>
              <Select.Option value={PaymentStatus.PENDING}>Pending</Select.Option>
              <Select.Option value={PaymentStatus.OVERDUE}>Overdue</Select.Option>
              <Select.Option value={PaymentStatus.CANCELLED}>Cancelled</Select.Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <RangePicker
              placeholder={['Start Date', 'End Date']}
              value={filters.startDate && filters.endDate ? [dayjs(filters.startDate), dayjs(filters.endDate)] as [dayjs.Dayjs, dayjs.Dayjs] : null}
              onChange={(dates) => setFilters({ 
                ...filters, 
                startDate: dates?.[0]?.format('YYYY-MM-DD'),
                endDate: dates?.[1]?.format('YYYY-MM-DD')
              })}
              className="w-full"
            />
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilters({})}
              className="w-full"
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Invoice Table */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Badge count={invoices?.length || 0} showZero>
              <FileTextOutlined className="text-2xl text-gray-400" />
            </Badge>
            <Text className="text-gray-600">
              {invoices?.length || 0} invoices found
            </Text>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={invoices}
          loading={isLoading}
          rowKey="id"
          pagination={{
            total: invoices?.length || 0,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} invoices`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modals */}
      <InvoiceModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          refetch();
        }}
        invoice={editingInvoice}
      />

      <InvoiceDetailsModal
        visible={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
};
