import React, { useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Divider,
  Typography,
  Space,
  message,
} from 'antd';
import {
  BankOutlined,
  SaveOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSettings, useUpdateSettings } from '../hooks';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const CompanySettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        companyName: settings.companyName || '',
        companyAddress: settings.companyAddress || '',
        companyPhone: settings.companyPhone || '',
        companyEmail: settings.companyEmail || '',
        companyTaxId: settings.companyTaxId || '',
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
        companyName: settings.companyName || '',
        companyAddress: settings.companyAddress || '',
        companyPhone: settings.companyPhone || '',
        companyEmail: settings.companyEmail || '',
        companyTaxId: settings.companyTaxId || '',
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
            <BankOutlined className="text-3xl text-blue-600" />
            <div>
              <Title level={2} className="mb-0">
                Company Information
              </Title>
              <Text type="secondary">Manage your company details and contact information</Text>
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
            <Col xs={24}>
              <Form.Item
                name="companyName"
                label="Company Name"
                tooltip="Your business or company name"
              >
                <Input
                  placeholder="Enter company name"
                  size="large"
                  maxLength={255}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="companyAddress"
                label="Company Address"
                tooltip="Full business address"
              >
                <TextArea
                  placeholder="Enter company address"
                  rows={3}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="companyPhone"
                label="Company Phone"
                tooltip="Business phone number"
              >
                <Input
                  placeholder="Enter phone number"
                  size="large"
                  maxLength={50}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="companyEmail"
                label="Company Email"
                rules={[
                  { type: 'email', message: 'Please enter a valid email address' },
                ]}
                tooltip="Business email address"
              >
                <Input
                  placeholder="Enter email address"
                  size="large"
                  type="email"
                  maxLength={255}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="companyTaxId"
                label="Tax ID / Registration Number"
                tooltip="Business tax identification or registration number"
              >
                <Input
                  placeholder="Enter tax ID or registration number"
                  size="large"
                  maxLength={100}
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

