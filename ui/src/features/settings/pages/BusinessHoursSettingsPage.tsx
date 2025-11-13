import React, { useEffect } from 'react';
import {
  Card,
  Form,
  Input,
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
  ClockCircleOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useSettings, useUpdateSettings } from '../hooks';

const { Title, Text } = Typography;
const { Option } = Select;

const BUSINESS_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const BusinessHoursSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        businessDays: settings.businessDays ? settings.businessDays.split(',').map((d: string) => d.trim()) : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        openingTime: settings.openingTime || '09:00',
        closingTime: settings.closingTime || '17:00',
      });
    }
  }, [settings, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Convert businessDays array to comma-separated string
      if (values.businessDays && Array.isArray(values.businessDays)) {
        values.businessDays = values.businessDays.join(',');
      }
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
        businessDays: settings.businessDays ? settings.businessDays.split(',').map((d: string) => d.trim()) : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        openingTime: settings.openingTime || '09:00',
        closingTime: settings.closingTime || '17:00',
      });
      message.info('Form reset to current settings');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <Card className="shadow-lg border-0 rounded-xl max-w-4xl mx-auto">
        <Space className="mb-6">
          <ClockCircleOutlined className="text-3xl text-blue-600" />
          <div>
            <Title level={2} className="mb-0">
              Business Hours
            </Title>
            <Text type="secondary">Configure business operating days and hours</Text>
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
            <Col xs={24}>
              <Form.Item
                name="businessDays"
                label="Business Days"
                tooltip="Select the days your business operates"
              >
                <Select
                  mode="multiple"
                  placeholder="Select business days"
                  size="large"
                >
                  {BUSINESS_DAYS.map((day) => (
                    <Option key={day} value={day}>
                      {day}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="openingTime"
                label="Opening Time"
                rules={[
                  { required: true, message: 'Please enter opening time' },
                  { pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, message: 'Time must be in HH:MM format' },
                ]}
                tooltip="Business opening time in HH:MM format"
              >
                <Input
                  placeholder="09:00"
                  size="large"
                  maxLength={5}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="closingTime"
                label="Closing Time"
                rules={[
                  { required: true, message: 'Please enter closing time' },
                  { pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, message: 'Time must be in HH:MM format' },
                ]}
                tooltip="Business closing time in HH:MM format"
              >
                <Input
                  placeholder="17:00"
                  size="large"
                  maxLength={5}
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

