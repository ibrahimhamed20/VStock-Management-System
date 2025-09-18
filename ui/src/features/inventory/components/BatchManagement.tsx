import React, { useState } from 'react';
import { Card, Typography, Button, Space, Row, Col, Table, Tag, Tooltip, Alert, Select } from 'antd';
import { 
  PlusOutlined, 
  FileTextOutlined, 
  CalendarOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { Form } from 'antd';
import { useExpiringBatches, useProducts } from '../hooks/useInventory';
import { BatchModal } from './BatchModal';
import type { BatchExpiry, Product } from '../types/inventory.types';

const { Title, Text } = Typography;
const { Option } = Select;

export const BatchManagement: React.FC = () => {
  const [batchForm] = Form.useForm();
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: expiringBatches, isLoading: isLoadingExpiring } = useExpiringBatches(7); // 7 days
  const { data: products } = useProducts();

  const openBatchModal = (product?: Product) => {
    setSelectedProduct(product || null);
    if (product) {
      batchForm.setFieldsValue({
        productId: product.id,
      });
    } else {
      batchForm.resetFields();
    }
    setBatchModalVisible(true);
  };

  const getExpiryColor = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 0) return 'red';
    if (daysUntilExpiry <= 3) return 'orange';
    if (daysUntilExpiry <= 7) return 'yellow';
    return 'green';
  };

  const getExpiryText = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 0) return 'Expired';
    if (daysUntilExpiry === 1) return '1 day';
    return `${daysUntilExpiry} days`;
  };

  const expiringColumns = [
    {
      title: 'Product',
      key: 'product',
      render: (batch: BatchExpiry) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
            <FileTextOutlined className="text-white text-sm" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{batch.productName}</div>
            <div className="text-sm text-gray-500">Batch: {batch.batchId}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Expiry Date',
      key: 'expiryDate',
      render: (batch: BatchExpiry) => (
        <div className="flex items-center space-x-2">
          <CalendarOutlined className="text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">
              {new Date(batch.expiryDate).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(batch.expiryDate).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Remaining Quantity',
      key: 'remainingQuantity',
      render: (batch: BatchExpiry) => (
        <div className="font-medium text-gray-900">
          {batch.remainingQuantity}
        </div>
      ),
    },
    {
      title: 'Days Until Expiry',
      key: 'daysUntilExpiry',
      render: (batch: BatchExpiry) => (
        <Tag 
          color={getExpiryColor(batch.daysUntilExpiry)}
          className="font-medium"
        >
          {getExpiryText(batch.daysUntilExpiry)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_batch: BatchExpiry) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Quick Actions */}
      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                <PlusOutlined className="text-white text-2xl" />
              </div>
              <Title level={4} className="mb-2">Create New Batch</Title>
              <Text type="secondary" className="block mb-4">
                Add a new product batch with expiry tracking
              </Text>
              <Button 
                type="primary" 
                size="large"
                onClick={() => openBatchModal()}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Create Batch
              </Button>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                <ClockCircleOutlined className="text-white text-2xl" />
              </div>
              <Title level={4} className="mb-2">Expiring Batches</Title>
              <Text type="secondary" className="block mb-4">
                {expiringBatches?.length || 0} batches expiring in 7 days
              </Text>
              <Button 
                type="primary" 
                size="large"
                onClick={() => {/* Scroll to expiring batches */}}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                View Expiring
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Expiring Batches Alert */}
      {expiringBatches && expiringBatches.length > 0 && (
        <Alert
          message={`${expiringBatches.length} batches are expiring within 7 days`}
          description={
            <div className="mt-2">
              {expiringBatches.slice(0, 3).map(batch => (
                <div key={batch.batchId} className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-2">
                    <FileTextOutlined className="text-orange-500" />
                    <Text strong>{batch.productName}</Text>
                    <Text type="secondary">({batch.batchId})</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Text type="secondary">Qty: {batch.remainingQuantity}</Text>
                    <Tag color={getExpiryColor(batch.daysUntilExpiry)}>
                      {getExpiryText(batch.daysUntilExpiry)}
                    </Tag>
                  </div>
                </div>
              ))}
              {expiringBatches.length > 3 && (
                <Text type="secondary" className="text-sm">
                  ... and {expiringBatches.length - 3} more
                </Text>
              )}
            </div>
          }
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          className="mb-6"
        />
      )}

      {/* Main Content */}
      <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Title level={4} className="mb-0">Expiring Batches (Next 7 Days)</Title>
            <Select
              placeholder="Filter by product"
              className="w-64 rounded-xl"
              allowClear
              showSearch
            >
              {products?.map(product => (
                <Option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {isLoadingExpiring ? (
          <div className="text-center py-8">
            <Text type="secondary">Loading expiring batches...</Text>
          </div>
        ) : expiringBatches && expiringBatches.length > 0 ? (
          <Table
            columns={expiringColumns}
            dataSource={expiringBatches}
            rowKey="batchId"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} batches`,
              className: "rounded-xl"
            }}
            className="rounded-xl"
            size="small"
          />
        ) : (
          <div className="text-center py-8">
            <Text type="secondary">No batches expiring in the next 7 days</Text>
          </div>
        )}
      </Card>

      {/* Batch Modal */}
      <BatchModal
        visible={batchModalVisible}
        onCancel={() => {
          setBatchModalVisible(false);
          setSelectedProduct(null);
          batchForm.resetFields();
        }}
        product={selectedProduct || undefined}
        form={batchForm}
      />
    </div>
  );
};
