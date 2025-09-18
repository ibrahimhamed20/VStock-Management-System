import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Row, Col, Typography, Switch } from 'antd';
import type { FormInstance } from 'antd';
import { 
  ShoppingOutlined, 
  DollarOutlined, 
  TagsOutlined, 
  TeamOutlined,
  BarcodeOutlined
} from '@ant-design/icons';
import { useInventoryOperations } from '../hooks/useInventoryMutations';
import { useCategories, useSuppliers } from '../hooks/useInventory';
import type { Product, CreateProductData, UpdateProductData } from '../types/inventory.types';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface ProductModalProps {
  visible: boolean;
  onCancel: () => void;
  editingProduct: Product | null;
  form: FormInstance;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  visible,
  onCancel,
  editingProduct,
  form,
}) => {
  const { createProduct, updateProduct, isCreatingProduct, isUpdatingProduct } = useInventoryOperations();
  const { data: categories } = useCategories();
  const { data: suppliers } = useSuppliers();

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      if (editingProduct) {
        const updateData: UpdateProductData = {
          name: values.name as string,
          description: values.description as string | undefined,
          unitCost: values.unitCost as number,
          sellingPrice: values.sellingPrice as number,
          minStock: values.minStock as number,
          maxStock: values.maxStock as number,
          category: values.category as string | undefined,
          supplier: values.supplier as string | undefined,
          isActive: values.isActive as boolean,
        };
        await updateProduct({ id: editingProduct.id, productData: updateData });
      } else {
        const createData: CreateProductData = {
          sku: values.sku as string,
          name: values.name as string,
          description: values.description as string | undefined,
          unitCost: values.unitCost as number,
          sellingPrice: values.sellingPrice as number,
          stock: (values.stock as number) || 0,
          minStock: values.minStock as number,
          maxStock: values.maxStock as number,
          category: values.category as string | undefined,
          supplier: values.supplier as string | undefined,
        };
        await createProduct(createData);
      }
      onCancel();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <Modal
      title={
        <div className="text-center">
          <Title level={3} className="mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {editingProduct ? 'Edit Product' : 'Create New Product'}
          </Title>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      className="rounded-2xl"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="space-y-6"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="sku"
              label={<span className="text-gray-700 font-medium">SKU</span>}
              rules={[{ required: true, message: 'SKU is required' }]}
            >
              <Input 
                size="large"
                prefix={<BarcodeOutlined className="text-gray-400" />}
                placeholder="Enter product SKU"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
                disabled={!!editingProduct}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name"
              label={<span className="text-gray-700 font-medium">Product Name</span>}
              rules={[{ required: true, message: 'Product name is required' }]}
            >
              <Input 
                size="large"
                prefix={<ShoppingOutlined className="text-gray-400" />}
                placeholder="Enter product name"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label={<span className="text-gray-700 font-medium">Description</span>}
        >
          <TextArea 
            rows={3}
            placeholder="Enter product description"
            className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="unitCost"
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
              name="sellingPrice"
              label={<span className="text-gray-700 font-medium">Selling Price</span>}
              rules={[{ required: true, message: 'Selling price is required' }]}
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
              name="stock"
              label={<span className="text-gray-700 font-medium">Initial Stock</span>}
              rules={[{ required: !editingProduct, message: 'Initial stock is required' }]}
            >
              <InputNumber
                size="large"
                placeholder="0"
                min={0}
                className="w-full rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
                disabled={!!editingProduct}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="minStock"
              label={<span className="text-gray-700 font-medium">Minimum Stock</span>}
              rules={[{ required: true, message: 'Minimum stock is required' }]}
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
              name="maxStock"
              label={<span className="text-gray-700 font-medium">Maximum Stock</span>}
              rules={[{ required: true, message: 'Maximum stock is required' }]}
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
              name="category"
              label={<span className="text-gray-700 font-medium">Category</span>}
            >
              <Select
                placeholder="Select category"
                size="large"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
                allowClear
                showSearch
              >
                {categories?.map(category => (
                  <Option key={category} value={category}>
                    <div className="flex items-center space-x-2">
                      <TagsOutlined className="text-blue-500" />
                      <span>{category}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="supplier"
              label={<span className="text-gray-700 font-medium">Supplier</span>}
            >
              <Select
                placeholder="Select supplier"
                size="large"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
                allowClear
                showSearch
              >
                {suppliers?.map(supplier => (
                  <Option key={supplier} value={supplier}>
                    <div className="flex items-center space-x-2">
                      <TeamOutlined className="text-green-500" />
                      <span>{supplier}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            {editingProduct && (
              <Form.Item
                name="isActive"
                label={<span className="text-gray-700 font-medium">Status</span>}
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="Active" 
                  unCheckedChildren="Inactive"
                  className="rounded-xl"
                />
              </Form.Item>
            )}
          </Col>
        </Row>

        <Form.Item className="mb-0 pt-4">
          <div className="flex space-x-4">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isCreatingProduct || isUpdatingProduct}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base"
            >
              {editingProduct ? 'Update Product' : 'Create Product'}
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
