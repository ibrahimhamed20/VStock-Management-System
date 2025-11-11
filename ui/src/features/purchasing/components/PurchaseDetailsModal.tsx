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
import type { Purchase } from '../types';
import { PurchaseStatus } from '../types';
import { formatCurrency, formatDate } from '../../common/utils';

const { Title, Text } = Typography;

interface PurchaseDetailsModalProps {
  visible: boolean;
  onCancel: () => void;
  purchase: Purchase | null;
}

export const PurchaseDetailsModal: React.FC<PurchaseDetailsModalProps> = ({
  visible,
  onCancel,
  purchase
}) => {
  if (!purchase) return null;

  const getStatusTag = (status: PurchaseStatus) => {
    const statusConfig = {
      [PurchaseStatus.DRAFT]: { color: 'default', text: 'Draft' },
      [PurchaseStatus.PENDING]: { color: 'orange', text: 'Pending' },
      [PurchaseStatus.APPROVED]: { color: 'blue', text: 'Approved' },
      [PurchaseStatus.ORDERED]: { color: 'cyan', text: 'Ordered' },
      [PurchaseStatus.RECEIVED]: { color: 'green', text: 'Received' },
      [PurchaseStatus.CANCELLED]: { color: 'red', text: 'Cancelled' },
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
      title: 'Received',
      dataIndex: 'receivedQuantity',
      key: 'receivedQuantity',
      width: 100,
      align: 'center' as const,
      render: (received: number) => (
        <Text type={received > 0 ? 'success' : 'secondary'}>{received}</Text>
      ),
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 120,
      align: 'right' as const,
      render: (cost: number) => formatCurrency(cost),
    },
    {
      title: 'Total',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 120,
      align: 'right' as const,
      render: (total: number) => (
        <Text strong className="text-blue-600">
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
          <span>Purchase Order Details - {purchase.purchaseNumber}</span>
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
            console.log('Print purchase:', purchase.id);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Print Purchase Order
        </Button>,
        <Button
          key="duplicate"
          icon={<CopyOutlined />}
          onClick={() => {
            // TODO: Implement duplicate functionality
            console.log('Duplicate purchase:', purchase.id);
          }}
        >
          Duplicate
        </Button>,
      ]}
    >
      <div className="space-y-6">
        {/* Header Information */}
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title="Purchase Status"
                value={getStatusTag(purchase.purchaseStatus)}
                valueStyle={{ fontSize: '16px' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Total Amount"
                value={formatCurrency(purchase.totalAmount)}
                valueStyle={{ color: '#2563eb', fontSize: '24px' }}
                prefix={<DollarOutlined />}
              />
            </Col>
          </Row>
        </Card>

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
                <Text strong>{purchase.supplierName}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Contact Person:</Text>
                <br />
                <Text strong>{purchase.supplierPaymentTerms}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Space>
                  <MailOutlined />
                  <Text type="secondary">Email:</Text>
                </Space>
                <br />
                <Text>{purchase.supplierEmail}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Space>
                  <PhoneOutlined />
                  <Text type="secondary">Phone:</Text>
                </Space>
                <br />
                <Text>{purchase.supplierPhone}</Text>
              </div>
            </Col>
            <Col span={24}>
              <div>
                <Text type="secondary">Address:</Text>
                <br />
                <Text>{purchase.supplierAddress}</Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Purchase Items */}
        <Card title={
          <Space>
            <FileTextOutlined className="text-green-600" />
            <span>Purchase Items</span>
          </Space>
        }>
          <Table
            columns={itemColumns}
            dataSource={purchase.items}
            rowKey="id"
            pagination={false}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong>Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text strong className="text-blue-600 text-lg">
                      {formatCurrency(purchase.subtotal)}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        {/* Financial Summary */}
        <Card title="Financial Summary">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Statistic
                title="Subtotal"
                value={formatCurrency(purchase.subtotal)}
                valueStyle={{ fontSize: '16px' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Tax Amount"
                value={formatCurrency(purchase.taxAmount)}
                valueStyle={{ fontSize: '16px' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Shipping Cost"
                value={formatCurrency(purchase.shippingCost)}
                valueStyle={{ fontSize: '16px' }}
              />
            </Col>
            <Col span={24}>
              <Divider />
              <Statistic
                title="Total Amount"
                value={formatCurrency(purchase.totalAmount)}
                valueStyle={{ color: '#2563eb', fontSize: '24px' }}
                prefix={<DollarOutlined />}
              />
            </Col>
          </Row>
        </Card>

        {/* Dates and Notes */}
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div>
                <Text type="secondary">Order Date:</Text>
                <br />
                <Text strong>{formatDate(purchase.orderDate)}</Text>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <Text type="secondary">Expected Delivery:</Text>
                <br />
                <Text strong>{formatDate(purchase.expectedDeliveryDate)}</Text>
              </div>
            </Col>
            {purchase.actualDeliveryDate && (
              <Col span={8}>
                <div>
                  <Text type="secondary">Actual Delivery:</Text>
                  <br />
                  <Text strong>{formatDate(purchase.actualDeliveryDate)}</Text>
                </div>
              </Col>
            )}
            {purchase.notes && (
              <Col span={24}>
                <Divider />
                <div>
                  <Text type="secondary">Notes:</Text>
                  <br />
                  <Text>{purchase.notes}</Text>
                </div>
              </Col>
            )}
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

