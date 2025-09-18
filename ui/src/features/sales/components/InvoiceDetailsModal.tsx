import React from 'react';
import {
  Modal,
  Table,
  Tag,
  Typography,
  Space,
  Button,
  Divider,
  Card,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  PrinterOutlined,
  CopyOutlined,
  DollarOutlined,
  FileTextOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import type { Invoice } from '../types';
import { PaymentStatus } from '../types';
import { formatCurrency, formatDate } from '../../common/utils';

const { Title, Text } = Typography;

interface InvoiceDetailsModalProps {
  visible: boolean;
  onCancel: () => void;
  invoice: Invoice | null;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  visible,
  onCancel,
  invoice
}) => {
  if (!invoice) return null;

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

  const itemColumns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: { productSku: string }) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-sm">
            SKU: {record.productSku}
          </Text>
        </div>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center' as const,
      render: (quantity: number) => (
        <Text strong>{quantity}</Text>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right' as const,
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      width: 120,
      align: 'right' as const,
      render: (discount: number) => (
        <Text type="secondary">
          {discount > 0 ? `-${formatCurrency(discount)}` : '-'}
        </Text>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      align: 'right' as const,
      render: (total: number) => (
        <Text strong className="text-green-600">
          {formatCurrency(total)}
        </Text>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined className="text-blue-600" />
          <span>Invoice Details - {invoice.invoiceNumber}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={() => {
            // TODO: Implement print functionality
            console.log('Print invoice:', invoice.id);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Print Invoice
        </Button>,
        <Button
          key="duplicate"
          icon={<CopyOutlined />}
          onClick={() => {
            // TODO: Implement duplicate functionality
            console.log('Duplicate invoice:', invoice.id);
          }}
        >
          Duplicate
        </Button>,
      ]}
    >
      <div className="space-y-6">
        {/* Invoice Header */}
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div className="space-y-2">
                <Title level={4} className="mb-2">
                  <FileTextOutlined className="mr-2" />
                  Invoice #{invoice.invoiceNumber}
                </Title>
                <div className="flex items-center space-x-4">
                  <Text strong>Status:</Text>
                  {getStatusTag(invoice.paymentStatus)}
                </div>
                <div className="flex items-center space-x-4">
                  <Text strong>Issue Date:</Text>
                  <Text>{formatDate(invoice.issueDate)}</Text>
                </div>
                <div className="flex items-center space-x-4">
                  <Text strong>Due Date:</Text>
                  <Text>{formatDate(invoice.dueDate)}</Text>
                </div>
              </div>
            </Col>
            
            <Col span={12}>
              <div className="text-right space-y-2">
                <Title level={4} className="mb-2">Total Amount</Title>
                <Text className="text-3xl font-bold text-green-600">
                  {formatCurrency(invoice.totalAmount)}
                </Text>
                {invoice.paymentStatus === PaymentStatus.PENDING && (
                  <div className="mt-2">
                    <Text type="secondary">
                      Remaining: {formatCurrency(invoice.remainingAmount)}
                    </Text>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Client Information */}
        <Card title={
          <Space>
            <UserOutlined className="text-blue-600" />
            <span>Client Information</span>
          </Space>
        }>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div className="space-y-1">
                <Text strong>Client Name</Text>
                <br />
                <Text>{invoice.clientName}</Text>
              </div>
            </Col>
            <Col span={8}>
              <div className="space-y-1">
                <Text strong>Email</Text>
                <br />
                <Text>
                  <MailOutlined className="mr-1" />
                  {invoice.clientEmail}
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div className="space-y-1">
                <Text strong>Phone</Text>
                <br />
                <Text>
                  <PhoneOutlined className="mr-1" />
                  {invoice.clientPhone}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Invoice Items */}
        <Card title={
          <Space>
            <DollarOutlined className="text-green-600" />
            <span>Invoice Items</span>
          </Space>
        }>
          <Table
            columns={itemColumns}
            dataSource={invoice.items}
            pagination={false}
            rowKey="id"
            size="small"
          />
        </Card>

        {/* Invoice Summary */}
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Subtotal:</Text>
                  <Text strong>{formatCurrency(invoice.subtotal)}</Text>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <Text>Discount:</Text>
                    <Text strong className="text-red-600">
                      -{formatCurrency(invoice.discountAmount)}
                    </Text>
                  </div>
                )}
                <div className="flex justify-between">
                  <Text>Tax:</Text>
                  <Text strong>{formatCurrency(invoice.taxAmount)}</Text>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between">
                  <Text strong className="text-lg">Total Amount:</Text>
                  <Text strong className="text-lg text-green-600">
                    {formatCurrency(invoice.totalAmount)}
                  </Text>
                </div>
              </div>
            </Col>
            
            <Col span={12}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Paid Amount:</Text>
                  <Text strong className="text-green-600">
                    {formatCurrency(invoice.paidAmount)}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text>Remaining Amount:</Text>
                  <Text strong className="text-orange-600">
                    {formatCurrency(invoice.remainingAmount)}
                  </Text>
                </div>
                <Divider className="my-2" />
                <div className="text-center">
                  <Statistic
                    title="Payment Status"
                    value={invoice.paymentStatus}
                    valueStyle={{
                      color: invoice.paymentStatus === PaymentStatus.PAID ? '#52c41a' : 
                             invoice.paymentStatus === PaymentStatus.OVERDUE ? '#ff4d4f' : '#faad14'
                    }}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card title="Notes">
            <Text>{invoice.notes}</Text>
          </Card>
        )}

        {/* Payment History */}
        {invoice.payments && invoice.payments.length > 0 && (
          <Card title="Payment History">
            <Table
              dataSource={invoice.payments}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Date',
                  dataIndex: 'processedAt',
                  key: 'processedAt',
                  render: (date: string) => formatDate(date),
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: (amount: number) => formatCurrency(amount),
                },
                {
                  title: 'Method',
                  dataIndex: 'method',
                  key: 'method',
                },
                {
                  title: 'Reference',
                  dataIndex: 'reference',
                  key: 'reference',
                },
              ]}
            />
          </Card>
        )}
      </div>
    </Modal>
  );
};
