import React from 'react';
import {
  Modal,
  Typography,
  Space,
  Button,
  Card,
  Row,
  Col,
  Tag,
  Statistic,
  Table,
} from 'antd';
import {
  PrinterOutlined,
  EditOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { Supplier } from '../types';
import { formatDate, formatCurrency } from '../../common/utils';
import { usePurchasesBySupplier } from '../hooks';

const { Text } = Typography;

interface SupplierDetailsModalProps {
  visible: boolean;
  onCancel: () => void;
  onEdit?: () => void;
  supplier: Supplier | null;
}

export const SupplierDetailsModal: React.FC<SupplierDetailsModalProps> = ({
  visible,
  onCancel,
  onEdit,
  supplier
}) => {
  // Call hook unconditionally (before early return)
  const { data: purchases, isLoading: purchasesLoading } = usePurchasesBySupplier(supplier?.id || '');

  if (!supplier) return null;

  const purchaseColumns = [
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
      title: 'Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: Date) => formatDate(date),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
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
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          DRAFT: { color: 'default', text: 'Draft' },
          PENDING: { color: 'orange', text: 'Pending' },
          APPROVED: { color: 'blue', text: 'Approved' },
          ORDERED: { color: 'cyan', text: 'Ordered' },
          RECEIVED: { color: 'green', text: 'Received' },
          CANCELLED: { color: 'red', text: 'Cancelled' },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  const totalPurchases = purchases?.length || 0;
  const totalAmount = purchases?.reduce((sum, p) => sum + p.totalAmount, 0) || 0;
  const averageAmount = totalPurchases > 0 ? totalAmount / totalPurchases : 0;

  return (
    <Modal
      title={
        <Space>
          <UserOutlined className="text-blue-600" />
          <span>Supplier Details - {supplier.name}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
        ...(onEdit ? [
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={onEdit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Edit Supplier
          </Button>
        ] : []),
        <Button
          key="print"
          icon={<PrinterOutlined />}
          onClick={() => {
            // TODO: Implement print functionality
            console.log('Print supplier:', supplier.id);
          }}
        >
          Print
        </Button>,
      ]}
    >
      <div className="space-y-6">
        {/* Supplier Information */}
        <Card title={
          <Space>
            <UserOutlined className="text-blue-600" />
            <span>Supplier Information</span>
          </Space>
        }>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div>
                <Text type="secondary">Supplier Name:</Text>
                <br />
                <Text strong>{supplier.name}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Contact Person:</Text>
                <br />
                <Text strong>{supplier.contactPerson}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Space>
                  <MailOutlined />
                  <Text type="secondary">Email:</Text>
                </Space>
                <br />
                <Text>{supplier.email}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Space>
                  <PhoneOutlined />
                  <Text type="secondary">Phone:</Text>
                </Space>
                <br />
                <Text>{supplier.phone}</Text>
              </div>
            </Col>
            <Col span={24}>
              <div>
                <Space>
                  <EnvironmentOutlined />
                  <Text type="secondary">Address:</Text>
                </Space>
                <br />
                <Text>{supplier.address}</Text>
              </div>
            </Col>
            {supplier.taxId && (
              <Col span={12}>
                <div>
                  <Text type="secondary">Tax ID:</Text>
                  <br />
                  <Text>{supplier.taxId}</Text>
                </div>
              </Col>
            )}
            <Col span={12}>
              <div>
                <Text type="secondary">Payment Terms:</Text>
                <br />
                <Text strong>{supplier.paymentTerms} days</Text>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Status:</Text>
                <br />
                <Tag color={supplier.isActive ? 'green' : 'red'}>
                  {supplier.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Statistics */}
        <Card title={
          <Space>
            <DollarOutlined className="text-green-600" />
            <span>Purchase Statistics</span>
          </Space>
        }>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Statistic
                title="Total Purchases"
                value={totalPurchases}
                valueStyle={{ fontSize: '24px' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Total Amount"
                value={totalAmount}
                prefix="$"
                valueStyle={{ color: '#2563eb', fontSize: '24px' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Average Order Value"
                value={averageAmount}
                prefix="$"
                valueStyle={{ fontSize: '20px' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Purchase History */}
        <Card title={
          <Space>
            <FileTextOutlined className="text-purple-600" />
            <span>Purchase History</span>
          </Space>
        }>
          <Table
            columns={purchaseColumns}
            dataSource={purchases}
            rowKey="id"
            loading={purchasesLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `${total} purchases`,
            }}
          />
        </Card>

        {/* Dates */}
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div>
                <Text type="secondary">Created:</Text>
                <br />
                <Text strong>{formatDate(supplier.createdAt)}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Last Updated:</Text>
                <br />
                <Text strong>{formatDate(supplier.updatedAt)}</Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

