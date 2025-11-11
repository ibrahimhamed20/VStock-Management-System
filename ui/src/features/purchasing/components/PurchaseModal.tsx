import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  Table,
  InputNumber,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { Purchase } from '../types';
import { useSuppliers, useActiveProducts, usePurchaseMutations } from '../hooks';
import { formatCurrency } from '../../common/utils';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface PurchaseModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  purchase?: Purchase | null;
}

interface PurchaseItemForm {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  purchase
}) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState<PurchaseItemForm[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const { data: suppliers } = useSuppliers();
  const { data: products } = useActiveProducts();
  const { createPurchase, updatePurchase } = usePurchaseMutations();

  const isEditing = !!purchase;

  // Calculate totals using useMemo to avoid infinite loops
  const { subtotal: calculatedSubtotal, taxAmount: calculatedTaxAmount, totalAmount: calculatedTotalAmount } = React.useMemo(() => {
    const newSubtotal = items.reduce((sum, item) => sum + item.totalCost, 0);
    const taxRate = form.getFieldValue('taxRate') || 0;
    const shippingCost = form.getFieldValue('shippingCost') || 0;
    const newTaxAmount = newSubtotal * (taxRate / 100);
    const newTotalAmount = newSubtotal + newTaxAmount + shippingCost;

    return {
      subtotal: newSubtotal,
      taxAmount: newTaxAmount,
      totalAmount: newTotalAmount,
    };
  }, [items, form]);

  // Update state when calculated values change
  useEffect(() => {
    setSubtotal(calculatedSubtotal);
    setTaxAmount(calculatedTaxAmount);
    setTotalAmount(calculatedTotalAmount);
  }, [calculatedSubtotal, calculatedTaxAmount, calculatedTotalAmount]);

  useEffect(() => {
    if (visible) {
      if (purchase) {
        form.setFieldsValue({
          supplierId: purchase.supplierId,
          taxRate: purchase.subtotal > 0 ? (purchase.taxAmount / purchase.subtotal * 100) : 0,
          shippingCost: purchase.shippingCost,
          expectedDeliveryDate: purchase.expectedDeliveryDate ? dayjs(purchase.expectedDeliveryDate) : undefined,
          notes: purchase.notes,
        });
        setItems(purchase.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost: item.totalCost,
          notes: item.notes,
        })));
      } else {
        form.resetFields();
        setItems([]);
      }
    }
  }, [visible, purchase, form]);

  const handleAddItem = () => {
    const newItem: PurchaseItemForm = {
      id: `temp-${Date.now()}`,
      productId: '',
      productName: '',
      productSku: '',
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleItemChange = (itemId: string, field: keyof PurchaseItemForm, value: string | number) => {
    const newItems = items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'quantity' || field === 'unitCost') {
          const total = updatedItem.quantity * updatedItem.unitCost;
          updatedItem.totalCost = Math.max(0, total);
        }
        
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const handleProductSelect = (itemId: string, productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      handleItemChange(itemId, 'productId', productId);
      handleItemChange(itemId, 'productName', product.name);
      handleItemChange(itemId, 'productSku', product.sku);
      handleItemChange(itemId, 'unitCost', product.price);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (items.length === 0) {
        message.error('Please add at least one item to the purchase order');
        return;
      }

      const purchaseData = {
        supplierId: values.supplierId,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          notes: item.notes,
        })),
        taxRate: values.taxRate || 0,
        shippingCost: values.shippingCost || 0,
        expectedDeliveryDate: values.expectedDeliveryDate?.format('YYYY-MM-DD'),
        notes: values.notes,
      };

      if (isEditing) {
        await updatePurchase.mutateAsync({
          id: purchase!.id,
          data: purchaseData,
        });
        message.success('Purchase order updated successfully');
      } else {
        await createPurchase.mutateAsync(purchaseData);
        message.success('Purchase order created successfully');
      }

      onSuccess();
    } catch {
      message.error('Failed to save purchase order');
    }
  };

  const itemColumns = [
    {
      title: 'Product',
      dataIndex: 'productId',
      key: 'productId',
      width: 200,
      render: (productId: string, record: PurchaseItemForm) => (
        <Select
          placeholder="Select Product"
          value={productId}
          onChange={(value) => handleProductSelect(record.id, value)}
          className="w-full"
          showSearch
          optionFilterProp="children"
        >
          {products?.map(product => (
            <Option key={product.id} value={product.id}>
              {product.name} ({product.sku})
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'productSku',
      key: 'productSku',
      width: 100,
      render: (sku: string) => <Text code>{sku}</Text>,
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (quantity: number, record: PurchaseItemForm) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => handleItemChange(record.id, 'quantity', value || 1)}
          className="w-full"
        />
      ),
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 120,
      render: (unitCost: number, record: PurchaseItemForm) => (
        <InputNumber
          min={0}
          step={0.01}
          value={unitCost}
          onChange={(value) => handleItemChange(record.id, 'unitCost', value || 0)}
          className="w-full"
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => parseFloat((value || '').replace(/\$\s?|(,*)/g, '')) || 0}
        />
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 120,
      render: (totalCost: number) => (
        <Text strong className="text-blue-600">
          {formatCurrency(totalCost)}
        </Text>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_: unknown, record: PurchaseItemForm) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id)}
        />
      ),
    },
  ];

  return (
    <Modal
      title={isEditing ? 'Edit Purchase Order' : 'Create Purchase Order'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={1000}
      okText={isEditing ? 'Update' : 'Create'}
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="supplierId"
              label="Supplier"
              rules={[{ required: true, message: 'Please select a supplier' }]}
            >
              <Select placeholder="Select Supplier" showSearch optionFilterProp="children">
                {suppliers?.map(supplier => (
                  <Option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="expectedDeliveryDate"
              label="Expected Delivery Date"
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Items</Divider>

        <div className="mb-4">
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddItem}
            className="w-full"
          >
            Add Item
          </Button>
        </div>

        <Table
          columns={itemColumns}
          dataSource={items}
          rowKey="id"
          pagination={false}
          size="small"
        />

        <Divider />

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="taxRate" label="Tax Rate (%)">
              <InputNumber
                min={0}
                max={100}
                step={0.1}
                className="w-full"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="shippingCost" label="Shipping Cost">
              <InputNumber
                min={0}
                step={0.01}
                className="w-full"
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: string | undefined) => {
                  if (!value) return 0;
                  const parsed = parseFloat(value.replace(/\$\s?|(,*)/g, ''));
                  return isNaN(parsed) ? 0 : parsed;
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Text>Subtotal:</Text>
            <Text strong className="ml-2">{formatCurrency(subtotal)}</Text>
          </Col>
          <Col span={12}>
            <Text>Tax:</Text>
            <Text strong className="ml-2">{formatCurrency(taxAmount)}</Text>
          </Col>
        </Row>

        <Row gutter={16} className="mt-2">
          <Col span={24}>
            <Text strong className="text-lg">Total:</Text>
            <Text strong className="ml-2 text-lg text-blue-600">{formatCurrency(totalAmount)}</Text>
          </Col>
        </Row>

        <Form.Item name="notes" label="Notes" className="mt-4">
          <TextArea rows={3} placeholder="Additional notes..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

