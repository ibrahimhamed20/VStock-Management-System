import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Row,
  Col,
  Typography,
  Divider,
  Table,
  InputNumber,
  message,
  Card
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  DollarOutlined
} from '@ant-design/icons';
import type { Invoice } from '../types';
import { useClients, useActiveProducts, useInvoiceMutations } from '../hooks';
import { formatCurrency } from '../../common/utils';

const { Text } = Typography;
const { Option } = Select;

interface InvoiceModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  invoice?: Invoice | null;
}

interface InvoiceItemForm {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalPrice: number;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  invoice
}) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState<InvoiceItemForm[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const { data: clients } = useClients();
  const { data: products } = useActiveProducts();
  const { createInvoice, updateInvoice } = useInvoiceMutations();

  const isEditing = !!invoice;

  const calculateTotals = useCallback(() => {
    const newSubtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const newDiscountAmount = form.getFieldValue('discountAmount') || 0;
    const taxRate = form.getFieldValue('taxRate') || 0;
    const newTaxAmount = (newSubtotal - newDiscountAmount) * (taxRate / 100);
    const newTotalAmount = newSubtotal - newDiscountAmount + newTaxAmount;

    setSubtotal(newSubtotal);
    setDiscountAmount(newDiscountAmount);
    setTaxAmount(newTaxAmount);
    setTotalAmount(newTotalAmount);
  }, [items, form]);

  useEffect(() => {
    if (visible) {
      if (invoice) {
        // Editing existing invoice
        form.setFieldsValue({
          clientId: invoice.clientId,
          taxRate: invoice.taxAmount / invoice.subtotal * 100,
          discountAmount: invoice.discountAmount,
          dueDate: invoice.dueDate,
          notes: invoice.notes,
        });
        setItems(invoice.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          totalPrice: item.totalPrice,
        })));
      } else {
        // Creating new invoice
        form.resetFields();
        setItems([]);
      }
      calculateTotals();
    }
  }, [visible, invoice, form, calculateTotals]);

  const handleAddItem = () => {
    const newItem: InvoiceItemForm = {
      id: `temp-${Date.now()}`,
      productId: '',
      productName: '',
      productSku: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      totalPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
    calculateTotals();
  };

  const handleItemChange = (itemId: string, field: keyof InvoiceItemForm, value: string | number) => {
    const newItems = items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total price when quantity, unit price, or discount changes
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
          const total = (updatedItem.quantity * updatedItem.unitPrice) - (updatedItem.discount || 0);
          updatedItem.totalPrice = Math.max(0, total);
        }
        
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
    calculateTotals();
  };

  const handleProductSelect = (itemId: string, productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      handleItemChange(itemId, 'productId', productId);
      handleItemChange(itemId, 'productName', product.name);
      handleItemChange(itemId, 'productSku', product.sku);
      handleItemChange(itemId, 'unitPrice', product.price);
    }
  };


  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (items.length === 0) {
        message.error('Please add at least one item to the invoice');
        return;
      }

      const invoiceData = {
        clientId: values.clientId,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          totalPrice: item.totalPrice,
        })),
        taxRate: values.taxRate || 0,
        discountAmount: values.discountAmount || 0,
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        notes: values.notes,
      };

      if (isEditing) {
        await updateInvoice.mutateAsync({
          id: invoice!.id,
          data: invoiceData,
        });
        message.success('Invoice updated successfully');
      } else {
        await createInvoice.mutateAsync(invoiceData);
        message.success('Invoice created successfully');
      }

      onSuccess();
    } catch {
      message.error('Failed to save invoice');
    }
  };

  const itemColumns = [
    {
      title: 'Product',
      dataIndex: 'productId',
      key: 'productId',
      width: 200,
      render: (productId: string, record: InvoiceItemForm) => (
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
      render: (quantity: number, record: InvoiceItemForm) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => handleItemChange(record.id, 'quantity', value || 1)}
          className="w-full"
        />
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (unitPrice: number, record: InvoiceItemForm) => (
        <InputNumber
          min={0}
          step={0.01}
          value={unitPrice}
          onChange={(value) => handleItemChange(record.id, 'unitPrice', value || 0)}
          className="w-full"
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
        />
      ),
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      width: 100,
      render: (discount: number, record: InvoiceItemForm) => (
        <InputNumber
          min={0}
          step={0.01}
          value={discount}
          onChange={(value) => handleItemChange(record.id, 'discount', value || 0)}
          className="w-full"
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
        />
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      render: (totalPrice: number) => (
        <Text strong className="text-green-600">
          {formatCurrency(totalPrice)}
        </Text>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_: unknown, record: InvoiceItemForm) => ( 
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
      title={
        <Space>
          <DollarOutlined className="text-blue-600" />
          <span>{isEditing ? 'Edit Invoice' : 'Create Invoice'}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={createInvoice.isPending || updateInvoice.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isEditing ? 'Update Invoice' : 'Create Invoice'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={calculateTotals}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="clientId"
              label="Client"
              rules={[{ required: true, message: 'Please select a client' }]}
            >
              <Select
                placeholder="Select Client"
                showSearch
                optionFilterProp="children"
              >
                {clients?.map(client => (
                  <Option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="dueDate"
              label="Due Date"
              rules={[{ required: true, message: 'Please select due date' }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Invoice Items</Divider>

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
          pagination={false}
          size="small"
          scroll={{ x: 800 }}
          rowKey="id"
        />

        <Divider />

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="taxRate" label="Tax Rate (%)">
              <InputNumber
                min={0}
                max={100}
                step={0.01}
                className="w-full"
                formatter={(value) => `${value}%`}
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item name="discountAmount" label="Discount Amount">
              <InputNumber
                min={0}
                step={0.01}
                className="w-full"
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item label="Notes">
              <Input.TextArea rows={3} placeholder="Additional notes..." />
            </Form.Item>
          </Col>
        </Row>

        <Card className="bg-gray-50">
          <Row gutter={16}>
            <Col span={6}>
              <Text strong>Subtotal:</Text>
              <br />
              <Text className="text-lg">{formatCurrency(subtotal)}</Text>
            </Col>
            <Col span={6}>
              <Text strong>Discount:</Text>
              <br />
              <Text className="text-lg text-red-600">-{formatCurrency(discountAmount)}</Text>
            </Col>
            <Col span={6}>
              <Text strong>Tax:</Text>
              <br />
              <Text className="text-lg">{formatCurrency(taxAmount)}</Text>
            </Col>
            <Col span={6}>
              <Text strong className="text-lg">Total:</Text>
              <br />
              <Text className="text-2xl font-bold text-green-600">
                {formatCurrency(totalAmount)}
              </Text>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};
