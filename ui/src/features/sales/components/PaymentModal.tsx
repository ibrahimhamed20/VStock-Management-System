import React from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Space,
  Row,
  Col,
  Typography,
  message,
  Card
} from 'antd';
import {
  DollarOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import type { CreatePaymentData } from '../types';
import { useCreatePayment } from '../hooks';

const { Text } = Typography;
const { Option } = Select;

interface PaymentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  invoiceId: string;
  invoiceNumber: string;
  remainingAmount: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  invoiceId,
  invoiceNumber,
  remainingAmount
}) => {
  const [form] = Form.useForm();
  const createPayment = useCreatePayment();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const paymentData: CreatePaymentData = {
        invoiceId,
        amount: values.amount,
        method: values.method,
        reference: values.reference,
        notes: values.notes,
      };

      await createPayment.mutateAsync(paymentData);
      message.success('Payment recorded successfully');
      form.resetFields();
      onSuccess();
    } catch {
      message.error('Failed to record payment');
    }
  };

  const paymentMethods = [
    { value: 'CASH', label: 'Cash', icon: <DollarOutlined /> },
    { value: 'CARD', label: 'Credit/Debit Card', icon: <CreditCardOutlined /> },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: <CreditCardOutlined /> },
    { value: 'CHECK', label: 'Check', icon: <CreditCardOutlined /> },
    { value: 'DIGITAL_WALLET', label: 'Digital Wallet', icon: <CreditCardOutlined /> },
  ];

  return (
    <Modal
      title={
        <Space>
          <DollarOutlined className="text-green-600" />
          <span>Record Payment</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={createPayment.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          Record Payment
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          amount: remainingAmount,
        }}
      >
        <Card className="bg-blue-50 mb-4">
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Invoice Number:</Text>
              <br />
              <Text className="text-lg">{invoiceNumber}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Remaining Amount:</Text>
              <br />
              <Text className="text-lg text-red-600">
                ${remainingAmount.toFixed(2)}
              </Text>
            </Col>
          </Row>
        </Card>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="amount"
              label="Payment Amount"
              rules={[
                { required: true, message: 'Please enter payment amount' },
                { type: 'number', min: 0.01, message: 'Amount must be greater than 0' },
                { 
                  validator: (_, value) => {
                    if (value > remainingAmount) {
                      return Promise.reject('Payment amount cannot exceed remaining amount');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                min={0.01}
                max={remainingAmount}
                step={0.01}
                className="w-full"
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="method"
              label="Payment Method"
              rules={[{ required: true, message: 'Please select payment method' }]}
            >
              <Select placeholder="Select Payment Method">
                {paymentMethods.map(method => (
                  <Option key={method.value} value={method.value}>
                    <Space>
                      {method.icon}
                      {method.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="reference"
              label="Reference/Transaction ID"
            >
              <Input placeholder="Enter reference number or transaction ID" />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="notes"
              label="Notes"
            >
              <Input.TextArea rows={3} placeholder="Additional payment notes..." />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
