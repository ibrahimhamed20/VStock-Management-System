import React, { useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Divider,
  Typography,
  Space,
  message,
} from 'antd';
import {
  FileTextOutlined,
  SaveOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSettings, useUpdateSettings } from '../hooks';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const InvoiceSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        invoicePrefix: settings.invoicePrefix || 'INV',
        defaultPaymentTerms: settings.defaultPaymentTerms || 30,
        invoiceFooter: settings.invoiceFooter || '',
      });
    }
  }, [settings, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updateSettings.mutateAsync(values);
    } catch (error) {
      if ((error as { errorFields?: { name: string[]; message: string }[] } | undefined)?.errorFields) {
        return;
      }
      console.error('Failed to update settings:', error);
    }
  };

  const handleReset = () => {
    if (settings) {
      form.setFieldsValue({
        invoicePrefix: settings.invoicePrefix || 'INV',
        defaultPaymentTerms: settings.defaultPaymentTerms || 30,
        invoiceFooter: settings.invoiceFooter || '',
      });
      message.info('Form reset to current settings');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <Card className="shadow-lg border-0 rounded-xl w-full mx-auto">
        <Space className="mb-6 w-full" direction="vertical" size="small">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/settings')}
            className="p-0"
          >
            Back to Settings
          </Button>
          <Space>
            <FileTextOutlined className="text-3xl text-blue-600" />
            <div>
              <Title level={2} className="mb-0">
                Invoice Settings
              </Title>
              <Text type="secondary">Configure invoice numbering, payment terms, and footer text</Text>
            </div>
          </Space>
        </Space>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={isLoading}
        >
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="invoicePrefix"
                label="Invoice Prefix"
                rules={[
                  { required: true, message: 'Please enter invoice prefix' },
                  { max: 10, message: 'Prefix must not exceed 10 characters' },
                  { pattern: /^[A-Z0-9]+$/, message: 'Prefix must contain only uppercase letters and numbers' },
                ]}
                tooltip="Prefix for invoice numbers (e.g., INV, BILL, REC)"
              >
                <Input
                  placeholder="Enter invoice prefix (e.g., INV)"
                  size="large"
                  maxLength={10}
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="defaultPaymentTerms"
                label="Default Payment Terms (Days)"
                rules={[
                  { required: true, message: 'Please enter payment terms' },
                  { type: 'number', min: 0, message: 'Payment terms must be at least 0' },
                  { type: 'number', max: 365, message: 'Payment terms must not exceed 365 days' },
                ]}
                tooltip="Default number of days for payment terms (e.g., 30 for Net 30)"
              >
                <InputNumber
                  placeholder="Enter payment terms in days"
                  size="large"
                  min={0}
                  max={365}
                  className="w-full"
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="invoiceFooter"
                label="Invoice Footer / Notes"
                tooltip="Text to display at the bottom of invoices (e.g., payment instructions, terms)"
              >
                <TextArea
                  placeholder="Enter invoice footer text or notes"
                  rows={4}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={updateSettings.isPending}
                size="large"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Settings
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                size="large"
              >
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

