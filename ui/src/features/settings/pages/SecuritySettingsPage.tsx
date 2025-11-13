import React, { useEffect } from 'react';
import {
  Card,
  Form,
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
  LockOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useSettings, useUpdateSettings } from '../hooks';

const { Title, Text } = Typography;

export const SecuritySettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        sessionTimeout: settings.sessionTimeout || 30,
        passwordMinLength: settings.passwordMinLength || 8,
        passwordRequireSpecialChars: settings.passwordRequireSpecialChars || false,
        maxLoginAttempts: settings.maxLoginAttempts || 5,
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
        sessionTimeout: settings.sessionTimeout || 30,
        passwordMinLength: settings.passwordMinLength || 8,
        passwordRequireSpecialChars: settings.passwordRequireSpecialChars || false,
        maxLoginAttempts: settings.maxLoginAttempts || 5,
      });
      message.info('Form reset to current settings');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <Card className="shadow-lg border-0 rounded-xl max-w-4xl mx-auto">
        <Space className="mb-6">
          <LockOutlined className="text-3xl text-blue-600" />
          <div>
            <Title level={2} className="mb-0">
              Security Settings
            </Title>
            <Text type="secondary">Configure security policies and access control</Text>
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
                name="sessionTimeout"
                label="Session Timeout (Minutes)"
                rules={[
                  { required: true, message: 'Please enter session timeout' },
                  { type: 'number', min: 5, message: 'Timeout must be at least 5 minutes' },
                  { type: 'number', max: 1440, message: 'Timeout must not exceed 1440 minutes (24 hours)' },
                ]}
                tooltip="User session timeout in minutes (5-1440)"
              >
                <InputNumber
                  placeholder="Enter timeout in minutes"
                  size="large"
                  min={5}
                  max={1440}
                  className="w-full"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="passwordMinLength"
                label="Password Minimum Length"
                rules={[
                  { required: true, message: 'Please enter minimum password length' },
                  { type: 'number', min: 4, message: 'Minimum length must be at least 4' },
                  { type: 'number', max: 32, message: 'Minimum length must not exceed 32' },
                ]}
                tooltip="Minimum password length requirement (4-32)"
              >
                <InputNumber
                  placeholder="Enter minimum length"
                  size="large"
                  min={4}
                  max={32}
                  className="w-full"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="maxLoginAttempts"
                label="Max Login Attempts"
                rules={[
                  { required: true, message: 'Please enter max login attempts' },
                  { type: 'number', min: 3, message: 'Max attempts must be at least 3' },
                  { type: 'number', max: 10, message: 'Max attempts must not exceed 10' },
                ]}
                tooltip="Maximum failed login attempts before account lockout (3-10)"
              >
                <InputNumber
                  placeholder="Enter max attempts"
                  size="large"
                  min={3}
                  max={10}
                  className="w-full"
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="passwordRequireSpecialChars"
                label="Require Special Characters in Password"
                tooltip="Enforce special character requirement for passwords"
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

