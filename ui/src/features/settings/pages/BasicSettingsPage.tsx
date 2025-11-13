import React, { useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Select,
  Divider,
  Typography,
  Space,
  message,
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSettings, useUpdateSettings } from '../hooks';

const { Title, Text } = Typography;
const { Option } = Select;

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'EGP', name: 'Egyptian Pound' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

export const BasicSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        currency: settings.currency,
        language: settings.language,
        fiscalYear: settings.fiscalYear || '',
        taxRate: settings.taxRate,
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
        currency: settings.currency,
        language: settings.language,
        fiscalYear: settings.fiscalYear || '',
        taxRate: settings.taxRate,
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
            <SettingOutlined className="text-3xl text-blue-600" />
            <div>
              <Title level={2} className="mb-0">
                Basic Settings
              </Title>
              <Text type="secondary">Configure currency, language, fiscal year, and tax rate</Text>
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
                name="currency"
                label="Currency"
                rules={[{ required: true, message: 'Please select a currency' }]}
                tooltip="Default currency used throughout the system"
              >
                <Select
                  placeholder="Select currency"
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {CURRENCIES.map((currency) => (
                    <Option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="language"
                label="Language"
                rules={[{ required: true, message: 'Please select a language' }]}
                tooltip="Default language for the system interface"
              >
                <Select
                  placeholder="Select language"
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {LANGUAGES.map((lang) => (
                    <Option key={lang.code} value={lang.code}>
                      {lang.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="fiscalYear"
                label="Fiscal Year"
                tooltip="The fiscal year for financial reporting (e.g., 2024)"
              >
                <Input
                  placeholder="Enter fiscal year (e.g., 2024)"
                  size="large"
                  maxLength={20}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="taxRate"
                label="Tax Rate (%)"
                rules={[
                  { required: true, message: 'Please enter tax rate' },
                  { type: 'number', min: 0, message: 'Tax rate must be at least 0' },
                  { type: 'number', max: 100, message: 'Tax rate must not exceed 100' },
                ]}
                tooltip="Default tax rate percentage (0-100)"
              >
                <InputNumber
                  placeholder="Enter tax rate"
                  size="large"
                  min={0}
                  max={100}
                  step={0.01}
                  precision={2}
                  className="w-full"
                  formatter={(value) => `${value}%`}
                  parser={(value: string | undefined) => Number(value?.replace('%', '')) || 0}
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

