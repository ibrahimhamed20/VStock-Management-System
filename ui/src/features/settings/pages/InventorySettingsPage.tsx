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
  ShoppingOutlined,
  SaveOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSettings, useUpdateSettings } from '../hooks';

const { Title, Text } = Typography;

export const InventorySettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        lowStockThreshold: settings.lowStockThreshold || 10,
        autoReorderEnabled: settings.autoReorderEnabled || false,
        defaultUnit: settings.defaultUnit || 'pcs',
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
        lowStockThreshold: settings.lowStockThreshold || 10,
        autoReorderEnabled: settings.autoReorderEnabled || false,
        defaultUnit: settings.defaultUnit || 'pcs',
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
            <ShoppingOutlined className="text-3xl text-blue-600" />
            <div>
              <Title level={2} className="mb-0">
                Inventory Settings
              </Title>
              <Text type="secondary">Configure stock thresholds and inventory preferences</Text>
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
                name="lowStockThreshold"
                label="Low Stock Threshold"
                rules={[
                  { required: true, message: 'Please enter low stock threshold' },
                  { type: 'number', min: 0, message: 'Threshold must be at least 0' },
                ]}
                tooltip="Minimum stock level before triggering low stock alerts"
              >
                <InputNumber
                  placeholder="Enter threshold"
                  size="large"
                  min={0}
                  className="w-full"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="defaultUnit"
                label="Default Unit of Measurement"
                tooltip="Default unit for products (e.g., pcs, kg, L)"
              >
                <Input
                  placeholder="Enter default unit (e.g., pcs)"
                  size="large"
                  maxLength={20}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="autoReorderEnabled"
                label="Auto Reorder Enabled"
                tooltip="Automatically create purchase orders when stock falls below threshold"
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

