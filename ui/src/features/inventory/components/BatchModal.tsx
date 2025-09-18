import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Row, Col, Typography, DatePicker } from 'antd';
import { 
  FileTextOutlined, 
  CalendarOutlined, 
  TeamOutlined,
  DollarOutlined,
  BarcodeOutlined
} from '@ant-design/icons';
import { useInventoryOperations } from '../hooks/useInventoryMutations';
import { useProducts } from '../hooks/useInventory';
import type { CreateBatchData, Batch, Product } from '../types/inventory.types';
import type { FormInstance } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

interface BatchModalProps {
  visible: boolean;
  onCancel: () => void;
  editingBatch?: Batch;
  product?: Product;
  form: FormInstance;
}

export const BatchModal: React.FC<BatchModalProps> = ({
  visible,
  onCancel,
  editingBatch,
  product,
  form,
}) => {
  const { createBatch, isCreatingBatch } = useInventoryOperations();
  const { data: products } = useProducts();

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      const batchData: CreateBatchData = {
        batchId: values.batchId as string,
        productId: values.productId as string,
        expiryDate: values.expiryDate as Date,
        quantity: values.quantity as number,
        manufacturingDate: values.manufacturingDate as Date | undefined,
        supplier: values.supplier as string | undefined,
        cost: values.cost as number,
      };
      
      await createBatch(batchData);
      onCancel();
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  return (
    <Modal
      title={
        <div className="text-center">
          <Title level={3} className="mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {editingBatch ? 'Edit Batch' : 'Create New Batch'}
          </Title>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      className="rounded-2xl"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="space-y-6"
        initialValues={{
          productId: product?.id,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="batchId"
              label={<span className="text-gray-700 font-medium">Batch ID</span>}
              rules={[{ required: true, message: 'Batch ID is required' }]}
            >
              <Input
                size="large"
                prefix={<BarcodeOutlined className="text-gray-400" />}
                placeholder="Enter batch ID"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="productId"
              label={<span className="text-gray-700 font-medium">Product</span>}
              rules={[{ required: true, message: 'Product is required' }]}
            >
              <Select
                placeholder="Select product"
                size="large"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
                showSearch
                optionFilterProp="children"
                disabled={!!product}
              >
                {products?.map(p => (
                  <Option key={p.id} value={p.id}>
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-gray-500">SKU: {p.sku}</div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="quantity"
              label={<span className="text-gray-700 font-medium">Quantity</span>}
              rules={[{ required: true, message: 'Quantity is required' }]}
            >
              <InputNumber
                size="large"
                placeholder="0"
                min={0}
                className="w-full rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="cost"
              label={<span className="text-gray-700 font-medium">Unit Cost</span>}
              rules={[{ required: true, message: 'Unit cost is required' }]}
            >
              <InputNumber
                size="large"
                prefix={<DollarOutlined className="text-gray-400" />}
                placeholder="0.00"
                min={0}
                step={0.01}
                precision={2}
                className="w-full rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="supplier"
              label={<span className="text-gray-700 font-medium">Supplier</span>}
            >
              <Input
                size="large"
                prefix={<TeamOutlined className="text-gray-400" />}
                placeholder="Enter supplier name"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="manufacturingDate"
              label={<span className="text-gray-700 font-medium">Manufacturing Date</span>}
            >
              <DatePicker
                size="large"
                className="w-full rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
                placeholder="Select manufacturing date"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="expiryDate"
              label={<span className="text-gray-700 font-medium">Expiry Date</span>}
              rules={[{ required: true, message: 'Expiry date is required' }]}
            >
              <DatePicker
                size="large"
                className="w-full rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
                placeholder="Select expiry date"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item className="mb-0 pt-4">
          <div className="flex space-x-4">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isCreatingBatch}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base"
            >
              {editingBatch ? 'Update Batch' : 'Create Batch'}
            </Button>
            <Button
              size="large"
              onClick={onCancel}
              className="h-12 rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-500 transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
