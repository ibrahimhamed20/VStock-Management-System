import React, { useEffect } from 'react';
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Divider,
  Typography,
  Space,
  message,
  Switch,
  Input,
} from 'antd';
import {
  BellOutlined,
  SaveOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSettings, useUpdateSettings } from '../hooks';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const NotificationSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        emailNotificationsEnabled: settings.emailNotificationsEnabled !== false,
        lowStockAlertsEnabled: settings.lowStockAlertsEnabled !== false,
        overdueInvoiceAlertsEnabled: settings.overdueInvoiceAlertsEnabled !== false,
        alertEmailRecipients: settings.alertEmailRecipients || '',
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
        emailNotificationsEnabled: settings.emailNotificationsEnabled !== false,
        lowStockAlertsEnabled: settings.lowStockAlertsEnabled !== false,
        overdueInvoiceAlertsEnabled: settings.overdueInvoiceAlertsEnabled !== false,
        alertEmailRecipients: settings.alertEmailRecipients || '',
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
            <BellOutlined className="text-3xl text-blue-600" />
            <div>
              <Title level={2} className="mb-0">
                Notification Settings
              </Title>
              <Text type="secondary">Configure email alerts and notification preferences</Text>
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
                name="emailNotificationsEnabled"
                label="Enable Email Notifications"
                tooltip="Enable or disable all email notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="lowStockAlertsEnabled"
                label="Enable Low Stock Alerts"
                tooltip="Send email alerts when stock falls below threshold"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="overdueInvoiceAlertsEnabled"
                label="Enable Overdue Invoice Alerts"
                tooltip="Send email alerts for overdue invoices"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="alertEmailRecipients"
                label="Alert Email Recipients"
                tooltip="Comma-separated list of email addresses to receive alerts"
              >
                <TextArea
                  placeholder="Enter email addresses separated by commas"
                  rows={3}
                  maxLength={500}
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

