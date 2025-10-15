import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Select,
  Tag, 
  Typography, 
  Row, 
  Col,
  Tooltip,
  Statistic
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  EyeOutlined, 
  DollarOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useInvoices } from '../hooks';
import type { Invoice, PaymentMethod } from '../types';
import { PaymentStatus } from '../types';
import { formatCurrency, formatDate } from '../../common/utils';
import { PaymentModal } from '../components/PaymentModal';
import { InvoiceDetailsModal } from '../components/InvoiceDetailsModal';

const { Title, Text } = Typography;

export const PaymentManagementPage: React.FC = () => {
  const [filters, setFilters] = useState({
    status: undefined as PaymentStatus | undefined,
    method: undefined as PaymentMethod | undefined,
    search: '',
    dateRange: undefined as [string, string] | undefined,
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  const { data: invoices, isLoading, refetch } = useInvoices({});
  // const { data: payments } = usePaymentsByInvoice(selectedInvoice?.id || '');

  // Filter invoices that have payments or are pending/partial
  const paymentRelevantInvoices = invoices?.filter(invoice => 
    invoice.paymentStatus === PaymentStatus.PENDING ||
    invoice.paymentStatus === PaymentStatus.PARTIAL ||
    invoice.paymentStatus === PaymentStatus.OVERDUE ||
    (invoice.payments && invoice.payments.length > 0)
  ) || [];

  const filteredInvoices = paymentRelevantInvoices.filter(invoice => {
    const matchesStatus = !filters.status || invoice.paymentStatus === filters.status;
    const matchesSearch = !filters.search || 
      invoice.invoiceNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setIsPaymentModalVisible(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsModalVisible(true);
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

  // const getPaymentMethodIcon = (method: PaymentMethod) => {
  //   switch (method) {
  //     case 'CASH':
  //       return <DollarOutlined className="text-green-500" />;
  //     case 'CARD':
  //       return <CreditCardOutlined className="text-blue-500" />;
  //     case 'BANK_TRANSFER':
  //       return <BankOutlined className="text-purple-500" />;
  //     case 'DIGITAL_WALLET':
  //       return <WalletOutlined className="text-orange-500" />;
  //     default:
  //       return <CreditCardOutlined className="text-gray-500" />;
  //   }
  // };

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
      render: (name: string) => (
        <div>
          <Text strong>{name}</Text>
        </div>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right' as const,
      render: (amount: number) => (
        <Text strong>{formatCurrency(amount)}</Text>
      ),
    },
    {
      title: 'Paid Amount',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 120,
      align: 'right' as const,
      render: (amount: number) => (
        <Text className="text-green-600">{formatCurrency(amount)}</Text>
      ),
    },
    {
      title: 'Remaining',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 120,
      align: 'right' as const,
      render: (amount: number) => (
        <Text className={amount > 0 ? 'text-red-600' : 'text-green-600'}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 120,
      render: (status: PaymentStatus) => getStatusTag(status),
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
          
          {record.remainingAmount > 0 && (
            <Tooltip title="Record Payment">
              <Button
                type="text"
                icon={<DollarOutlined />}
                onClick={() => handleRecordPayment(record)}
                className="text-green-600 hover:text-green-700"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const totalInvoices = filteredInvoices.length;
  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const totalPaid = filteredInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const totalRemaining = filteredInvoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0);
  // const overdueCount = filteredInvoices.filter(invoice => invoice.paymentStatus === PaymentStatus.OVERDUE).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <Text>Loading payment data...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="text-gray-900 mb-2">
            Payment Management
          </Title>
          <Text className="text-gray-600 text-lg">
            Track payments, manage outstanding invoices, and monitor payment status
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <Statistic
              title="Total Invoices"
              value={totalInvoices}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <Statistic
              title="Total Amount"
              value={totalAmount}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <Statistic
              title="Total Paid"
              value={totalPaid}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <Statistic
              title="Outstanding"
              value={totalRemaining}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: totalRemaining > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

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
              <Select.Option value={PaymentStatus.PARTIAL}>Partial</Select.Option>
              <Select.Option value={PaymentStatus.OVERDUE}>Overdue</Select.Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilters({ 
                status: undefined, 
                method: undefined, 
                search: '', 
                dateRange: undefined 
              })}
              className="w-full"
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Payment Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} invoices`,
          }}
          scroll={{ x: 1000 }}
          rowKey="id"
        />
      </Card>

      {/* Payment Modal */}
      {selectedInvoiceForPayment && (
        <PaymentModal
          visible={isPaymentModalVisible}
          onCancel={() => {
            setIsPaymentModalVisible(false);
            setSelectedInvoiceForPayment(null);
          }}
          onSuccess={() => {
            setIsPaymentModalVisible(false);
            setSelectedInvoiceForPayment(null);
            refetch();
          }}
          invoiceId={selectedInvoiceForPayment.id}
          invoiceNumber={selectedInvoiceForPayment.invoiceNumber}
          remainingAmount={selectedInvoiceForPayment.remainingAmount}
        />
      )}

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        visible={isDetailsModalVisible}
        onCancel={() => {
          setIsDetailsModalVisible(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />
    </div>
  );
};
