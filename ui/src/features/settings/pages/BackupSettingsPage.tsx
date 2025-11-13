import React, { useEffect } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Button,
  Row,
  Col,
  Select,
  Divider,
  Typography,
  Space,
  message,
  Switch,
} from 'antd';
import {
  DatabaseOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useSettings, useUpdateSettings } from '../hooks';

const { Title, Text } = Typography;
const { Option } = Select;

const BACKUP_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const BackupSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        autoBackupEnabled: settings.autoBackupEnabled || false,
        backupFrequency: settings.backupFrequency || 'daily',
        backupRetentionDays: settings.backupRetentionDays || 30,
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
        autoBackupEnabled: settings.autoBackupEnabled || false,
        backupFrequency: settings.backupFrequency || 'daily',
        backupRetentionDays: settings.backupRetentionDays || 30,
      });
      message.info('Form reset to current settings');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <Card className="shadow-lg border-0 rounded-xl max-w-4xl mx-auto">
        <Space className="mb-6">
          <DatabaseOutlined className="text-3xl text-blue-600" />
          <div>
            <Title level={2} className="mb-0">
              Backup Settings
            </Title>
            <Text type="secondary">Configure automatic backup frequency and retention</Text>
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
                name="autoBackupEnabled"
                label="Enable Auto Backup"
                tooltip="Automatically backup database at scheduled intervals"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="backupFrequency"
                label="Backup Frequency"
                tooltip="How often to perform automatic backups"
              >
                <Select
                  placeholder="Select frequency"
                  size="large"
                >
                  {BACKUP_FREQUENCIES.map((freq) => (
                    <Option key={freq.value} value={freq.value}>
                      {freq.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="backupRetentionDays"
                label="Backup Retention (Days)"
                rules={[
                  { required: true, message: 'Please enter retention days' },
                  { type: 'number', min: 1, message: 'Retention must be at least 1 day' },
                  { type: 'number', max: 365, message: 'Retention must not exceed 365 days' },
                ]}
                tooltip="Number of days to keep backup files (1-365)"
              >
                <InputNumber
                  placeholder="Enter retention days"
                  size="large"
                  min={1}
                  max={365}
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

