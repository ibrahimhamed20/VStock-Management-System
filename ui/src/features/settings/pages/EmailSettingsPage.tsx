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
  Switch,
} from 'antd';
import {
  MailOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useSettings, useUpdateSettings } from '../hooks';

const { Title, Text } = Typography;

export const EmailSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        smtpHost: settings.smtpHost || '',
        smtpPort: settings.smtpPort || 587,
        smtpSecure: settings.smtpSecure || false,
        smtpUsername: settings.smtpUsername || '',
        smtpPassword: settings.smtpPassword || '',
        emailFrom: settings.emailFrom || '',
        emailFromName: settings.emailFromName || '',
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
        smtpHost: settings.smtpHost || '',
        smtpPort: settings.smtpPort || 587,
        smtpSecure: settings.smtpSecure || false,
        smtpUsername: settings.smtpUsername || '',
        smtpPassword: settings.smtpPassword || '',
        emailFrom: settings.emailFrom || '',
        emailFromName: settings.emailFromName || '',
      });
      message.info('Form reset to current settings');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <Card className="shadow-lg border-0 rounded-xl max-w-4xl mx-auto">
        <Space className="mb-6">
          <MailOutlined className="text-3xl text-blue-600" />
          <div>
            <Title level={2} className="mb-0">
              Email/SMTP Settings
            </Title>
            <Text type="secondary">Configure SMTP server settings for email notifications</Text>
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
            <Col xs={24} sm={12}>
              <Form.Item
                name="smtpHost"
                label="SMTP Host"
                tooltip="SMTP server hostname (e.g., smtp.gmail.com)"
              >
                <Input
                  placeholder="Enter SMTP host"
                  size="large"
                  maxLength={255}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="smtpPort"
                label="SMTP Port"
                rules={[
                  { type: 'number', min: 1, message: 'Port must be at least 1' },
                  { type: 'number', max: 65535, message: 'Port must not exceed 65535' },
                ]}
                tooltip="SMTP server port (usually 587 for TLS, 465 for SSL)"
              >
                <InputNumber
                  placeholder="Enter SMTP port"
                  size="large"
                  min={1}
                  max={65535}
                  className="w-full"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="smtpUsername"
                label="SMTP Username"
                tooltip="SMTP authentication username"
              >
                <Input
                  placeholder="Enter SMTP username"
                  size="large"
                  maxLength={255}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="smtpPassword"
                label="SMTP Password"
                tooltip="SMTP authentication password"
              >
                <Input.Password
                  placeholder="Enter SMTP password"
                  size="large"
                  maxLength={255}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="emailFrom"
                label="From Email Address"
                rules={[
                  { type: 'email', message: 'Please enter a valid email address' },
                ]}
                tooltip="Default sender email address"
              >
                <Input
                  placeholder="Enter from email"
                  size="large"
                  type="email"
                  maxLength={255}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="emailFromName"
                label="From Name"
                tooltip="Display name for sender emails"
              >
                <Input
                  placeholder="Enter from name"
                  size="large"
                  maxLength={255}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="smtpSecure"
                label="Use SSL/TLS"
                tooltip="Enable secure connection (SSL/TLS)"
                valuePropName="checked"
              >
                <Switch />
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

