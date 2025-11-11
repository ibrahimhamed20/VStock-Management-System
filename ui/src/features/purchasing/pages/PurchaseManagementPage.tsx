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
  CheckCircleOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { usePurchases, usePurchaseMutations } from '../hooks';
import type { Purchase, PurchaseFilters } from '../types';
import { PurchaseStatus } from '../types';
import { formatCurrency, formatDate } from '../../common/utils';
import { PurchaseModal } from '../components/PurchaseModal';
import { PurchaseDetailsModal } from '../components/PurchaseDetailsModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const PurchaseManagementPage: React.FC = () => {
  const [filters, setFilters] = useState<PurchaseFilters>({});
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

  const { data: purchases, isLoading, error, refetch } = usePurchases(filters);
  const { deletePurchase, cancelPurchase, approvePurchase, orderPurchase } = usePurchaseMutations();

  const handleCreatePurchase = () => {
    setEditingPurchase(null);
    setIsModalVisible(true);
  };

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setIsModalVisible(true);
  };

  const handleViewPurchase = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDetailsModalVisible(true);
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    try {
      await deletePurchase.mutateAsync(purchaseId);
      message.success('Purchase deleted successfully');
      refetch();
    } catch {
      message.error('Failed to delete purchase');
    }
  };

  const handleCancelPurchase = async (purchaseId: string) => {
    try {
      await cancelPurchase.mutateAsync(purchaseId);
      message.success('Purchase cancelled successfully');
      refetch();
    } catch {
      message.error('Failed to cancel purchase');
    }
  };

  const handleApprovePurchase = async (purchaseId: string) => {
    try {
      await approvePurchase.mutateAsync(purchaseId);
      message.success('Purchase approved successfully');
      refetch();
    } catch {
      message.error('Failed to approve purchase');
    }
  };

  const handleOrderPurchase = async (purchaseId: string) => {
    try {
      await orderPurchase.mutateAsync(purchaseId);
      message.success('Purchase marked as ordered');
      refetch();
    } catch {
      message.error('Failed to mark purchase as ordered');
    }
  };

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

  const columns = [
    {
      title: 'Purchase #',
      dataIndex: 'purchaseNumber',
      key: 'purchaseNumber',
      width: 120,
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
      width: 200,
      render: (text: string, record: Purchase) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-sm">
            {record.supplierEmail}
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
        <Text strong className="text-blue-600">
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'purchaseStatus',
      key: 'purchaseStatus',
      width: 100,
      render: (status: PurchaseStatus) => getStatusTag(status),
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Expected Delivery',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: Purchase) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewPurchase(record)}
            />
          </Tooltip>
          
          {record.purchaseStatus !== PurchaseStatus.CANCELLED && record.purchaseStatus !== PurchaseStatus.RECEIVED && (
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEditPurchase(record)}
              />
            </Tooltip>
          )}

          {record.purchaseStatus === PurchaseStatus.PENDING && (
            <Tooltip title="Approve">
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprovePurchase(record.id)}
                className="text-green-600"
              />
            </Tooltip>
          )}

          {record.purchaseStatus === PurchaseStatus.APPROVED && (
            <Tooltip title="Mark as Ordered">
              <Button
                type="text"
                icon={<ShoppingOutlined />}
                onClick={() => handleOrderPurchase(record.id)}
                className="text-blue-600"
              />
            </Tooltip>
          )}

          {record.purchaseStatus !== PurchaseStatus.RECEIVED && record.purchaseStatus !== PurchaseStatus.CANCELLED && (
            <Tooltip title="Cancel">
              <Popconfirm
                title="Are you sure you want to cancel this purchase?"
                onConfirm={() => handleCancelPurchase(record.id)}
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

          {record.purchaseStatus === PurchaseStatus.CANCELLED && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this purchase? This action cannot be undone."
                onConfirm={() => handleDeletePurchase(record.id)}
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
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <Text type="danger">Failed to load purchases. Please try again.</Text>
        </div>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={1} className="text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Purchase Order Management
          </Title>
          <Text className="text-gray-600 text-lg">
            Manage purchase orders, track deliveries, and monitor procurement status
          </Text>
        </div>

        <div className="flex justify-between items-center">
          <div></div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreatePurchase}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create Purchase Order
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Search purchases..."
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
                <Select.Option value={PurchaseStatus.DRAFT}>Draft</Select.Option>
                <Select.Option value={PurchaseStatus.PENDING}>Pending</Select.Option>
                <Select.Option value={PurchaseStatus.APPROVED}>Approved</Select.Option>
                <Select.Option value={PurchaseStatus.ORDERED}>Ordered</Select.Option>
                <Select.Option value={PurchaseStatus.RECEIVED}>Received</Select.Option>
                <Select.Option value={PurchaseStatus.CANCELLED}>Cancelled</Select.Option>
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

        {/* Purchase Table */}
        <Card>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Badge count={purchases?.length || 0} showZero>
                <ShoppingOutlined className="text-2xl text-gray-400" />
              </Badge>
              <Text className="text-gray-600">
                {purchases?.length || 0} purchases found
              </Text>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={purchases}
            loading={isLoading}
            rowKey="id"
            pagination={{
              total: purchases?.length || 0,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} purchases`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* Modals */}
        <PurchaseModal
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onSuccess={() => {
            setIsModalVisible(false);
            refetch();
          }}
          purchase={editingPurchase}
        />

        <PurchaseDetailsModal
          visible={isDetailsModalVisible}
          onCancel={() => setIsDetailsModalVisible(false)}
          purchase={selectedPurchase}
        />
      </div>
    </div>
  );
};

