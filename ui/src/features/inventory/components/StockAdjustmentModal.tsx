import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Row, Col, Typography } from 'antd';
import { 
  MinusOutlined, 
  PlusOutlined
} from '@ant-design/icons';
import { useInventoryOperations } from '../hooks/useInventoryMutations';
import { useProducts } from '../hooks/useInventory';
import type { StockAdjustment, Product } from '../types/inventory.types';
import type { FormInstance } from 'antd';

const { Title } = Typography;
const { Option } = Select;

interface StockAdjustmentModalProps {
  visible: boolean;
  onCancel: () => void;
  product?: Product;
  form: FormInstance;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  visible,
  onCancel,
  product,
  form,
}) => {
  const { adjustStock, isAdjustingStock } = useInventoryOperations();
  const { data: products } = useProducts();

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      const stockAdjustment: StockAdjustment = {
        productId: values.productId as string,
        quantity: values.quantity as number,
        reason: values.reason as string,
        type: values.type as 'IN' | 'OUT',
        reference: values.reference as string | undefined,
      };
      
      await adjustStock(stockAdjustment);
      onCancel();
    } catch (error) {
      console.error('Error adjusting stock:', error);
    }
  };

  const adjustmentTypes = [
    { value: 'IN', label: 'Stock In', icon: <PlusOutlined className="text-green-500" />, color: 'green' },
    { value: 'OUT', label: 'Stock Out', icon: <MinusOutlined className="text-red-500" />, color: 'red' },
  ];

  return (
    <Modal
      title={
        <div className="text-center">
          <Title level={3} className="mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Stock Adjustment
          </Title>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      className="rounded-2xl"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="space-y-6"
        initialValues={{
          productId: product?.id,
          type: 'IN',
        }}
      >
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
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-500">SKU: {p.sku} | Stock: {p.stock}</div>
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label={<span className="text-gray-700 font-medium">Adjustment Type</span>}
              rules={[{ required: true, message: 'Adjustment type is required' }]}
            >
              <Select
                placeholder="Select type"
                size="large"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              >
                {adjustmentTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      {type.icon}
                      <span>{type.label}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
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
        </Row>

        <Form.Item
          name="reason"
          label={<span className="text-gray-700 font-medium">Reason</span>}
          rules={[{ required: true, message: 'Reason is required' }]}
        >
          <Select
            placeholder="Select reason"
            size="large"
            className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
          >
            <Option value="Purchase">Purchase</Option>
            <Option value="Sale">Sale</Option>
            <Option value="Return">Return</Option>
            <Option value="Damaged">Damaged</Option>
            <Option value="Lost">Lost</Option>
            <Option value="Transfer">Transfer</Option>
            <Option value="Adjustment">Manual Adjustment</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="reference"
          label={<span className="text-gray-700 font-medium">Reference (Optional)</span>}
        >
          <Input
            size="large"
            placeholder="Invoice number, order ID, etc."
            className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
          />
        </Form.Item>

        <Form.Item className="mb-0 pt-4">
          <div className="flex space-x-4">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isAdjustingStock}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base"
            >
              Adjust Stock
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
