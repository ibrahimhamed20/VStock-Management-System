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
  PrinterOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useSettings, useUpdateSettings } from '../hooks';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PAPER_SIZES = ['A4', 'A3', 'Letter', 'Legal'];

export const PrintSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        defaultPaperSize: settings.defaultPaperSize || 'A4',
        logoUrl: settings.logoUrl || '',
        printHeader: settings.printHeader || '',
        printFooter: settings.printFooter || '',
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
        defaultPaperSize: settings.defaultPaperSize || 'A4',
        logoUrl: settings.logoUrl || '',
        printHeader: settings.printHeader || '',
        printFooter: settings.printFooter || '',
      });
      message.info('Form reset to current settings');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <Card className="shadow-lg border-0 rounded-xl max-w-4xl mx-auto">
        <Space className="mb-6">
          <PrinterOutlined className="text-3xl text-blue-600" />
          <div>
            <Title level={2} className="mb-0">
              Print/Export Settings
            </Title>
            <Text type="secondary">Configure print templates, paper size, and branding</Text>
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
                name="defaultPaperSize"
                label="Default Paper Size"
                tooltip="Default paper size for printing"
              >
                <Select
                  placeholder="Select paper size"
                  size="large"
                >
                  {PAPER_SIZES.map((size) => (
                    <Option key={size} value={size}>
                      {size}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="logoUrl"
                label="Logo URL"
                tooltip="URL or path to company logo for invoices and reports"
              >
                <Input
                  placeholder="Enter logo URL"
                  size="large"
                  maxLength={500}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="printHeader"
                label="Print Header"
                tooltip="Text to display at the top of printed documents"
              >
                <TextArea
                  placeholder="Enter header text"
                  rows={3}
                  showCount
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="printFooter"
                label="Print Footer"
                tooltip="Text to display at the bottom of printed documents"
              >
                <TextArea
                  placeholder="Enter footer text"
                  rows={3}
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

