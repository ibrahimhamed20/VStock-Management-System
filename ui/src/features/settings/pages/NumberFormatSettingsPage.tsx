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
  DollarOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useSettings, useUpdateSettings } from '../hooks';

const { Title, Text } = Typography;

export const NumberFormatSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        decimalSeparator: settings.decimalSeparator || '.',
        thousandSeparator: settings.thousandSeparator || ',',
        decimalPlaces: settings.decimalPlaces || 2,
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
        decimalSeparator: settings.decimalSeparator || '.',
        thousandSeparator: settings.thousandSeparator || ',',
        decimalPlaces: settings.decimalPlaces || 2,
      });
      message.info('Form reset to current settings');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <Card className="shadow-lg border-0 rounded-xl max-w-4xl mx-auto">
        <Space className="mb-6">
          <DollarOutlined className="text-3xl text-blue-600" />
          <div>
            <Title level={2} className="mb-0">
              Number Format Settings
            </Title>
            <Text type="secondary">Configure how numbers are displayed throughout the system</Text>
          </div>
        </Space>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={isLoading}
        >
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="decimalSeparator"
                label="Decimal Separator"
                rules={[
                  { required: true, message: 'Please enter decimal separator' },
                  { max: 1, message: 'Separator must be a single character' },
                ]}
                tooltip="Character used to separate decimal part (e.g., . or ,)"
              >
                <Input
                  placeholder="."
                  size="large"
                  maxLength={1}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                name="thousandSeparator"
                label="Thousand Separator"
                rules={[
                  { required: true, message: 'Please enter thousand separator' },
                  { max: 1, message: 'Separator must be a single character' },
                ]}
                tooltip="Character used to separate thousands (e.g., , or .)"
              >
                <Input
                  placeholder=","
                  size="large"
                  maxLength={1}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                name="decimalPlaces"
                label="Decimal Places"
                rules={[
                  { required: true, message: 'Please enter decimal places' },
                  { type: 'number', min: 0, message: 'Decimal places must be at least 0' },
                  { type: 'number', max: 6, message: 'Decimal places must not exceed 6' },
                ]}
                tooltip="Number of decimal places to display (0-6)"
              >
                <InputNumber
                  placeholder="2"
                  size="large"
                  min={0}
                  max={6}
                  className="w-full"
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

