import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import {
  SettingOutlined,
  BankOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  MailOutlined,
  PrinterOutlined,
  DollarOutlined,
  LockOutlined,
  BellOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const SETTINGS_CATEGORIES = [
  {
    key: 'basic',
    title: 'Basic Settings',
    description: 'Currency, language, fiscal year, and tax rate',
    icon: <SettingOutlined className="text-2xl" />,
    path: '/settings/basic',
    color: 'blue',
  },
  {
    key: 'company',
    title: 'Company Information',
    description: 'Company details and contact information',
    icon: <BankOutlined className="text-2xl" />,
    path: '/settings/company',
    color: 'green',
  },
  {
    key: 'invoice',
    title: 'Invoice Settings',
    description: 'Invoice numbering, payment terms, and footer',
    icon: <FileTextOutlined className="text-2xl" />,
    path: '/settings/invoice',
    color: 'purple',
  },
  {
    key: 'datetime',
    title: 'Date & Time Settings',
    description: 'Timezone and date format preferences',
    icon: <CalendarOutlined className="text-2xl" />,
    path: '/settings/datetime',
    color: 'orange',
  },
  {
    key: 'inventory',
    title: 'Inventory Settings',
    description: 'Stock thresholds and inventory preferences',
    icon: <ShoppingOutlined className="text-2xl" />,
    path: '/settings/inventory',
    color: 'cyan',
  },
  {
    key: 'email',
    title: 'Email/SMTP Settings',
    description: 'SMTP server configuration for email notifications',
    icon: <MailOutlined className="text-2xl" />,
    path: '/settings/email',
    color: 'magenta',
  },
  {
    key: 'print',
    title: 'Print/Export Settings',
    description: 'Print templates, paper size, and branding',
    icon: <PrinterOutlined className="text-2xl" />,
    path: '/settings/print',
    color: 'geekblue',
  },
  {
    key: 'number-format',
    title: 'Number Format Settings',
    description: 'Decimal and thousand separators configuration',
    icon: <DollarOutlined className="text-2xl" />,
    path: '/settings/number-format',
    color: 'gold',
  },
  {
    key: 'security',
    title: 'Security Settings',
    description: 'Security policies and access control',
    icon: <LockOutlined className="text-2xl" />,
    path: '/settings/security',
    color: 'red',
  },
  {
    key: 'notifications',
    title: 'Notification Settings',
    description: 'Email alerts and notification preferences',
    icon: <BellOutlined className="text-2xl" />,
    path: '/settings/notifications',
    color: 'lime',
  },
  {
    key: 'backup',
    title: 'Backup Settings',
    description: 'Automatic backup frequency and retention',
    icon: <DatabaseOutlined className="text-2xl" />,
    path: '/settings/backup',
    color: 'volcano',
  },
  {
    key: 'business-hours',
    title: 'Business Hours',
    description: 'Operating days and hours configuration',
    icon: <ClockCircleOutlined className="text-2xl" />,
    path: '/settings/business-hours',
    color: 'blue',
  },
];

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <Card className="shadow-lg border-0 rounded-xl w-full mx-auto">
        <Space className="mb-6">
          <SettingOutlined className="text-3xl text-blue-600" />
          <div>
            <Title level={2} className="mb-0">
              System Settings
            </Title>
            <Text type="secondary">Manage your system configuration and preferences</Text>
          </div>
        </Space>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {SETTINGS_CATEGORIES.map((category) => (
            <Card
              key={category.key}
              hoverable
              className="cursor-pointer transition-all duration-300 hover:shadow-xl border-2 hover:border-blue-400"
              onClick={() => navigate(category.path)}
            >
              <Space direction="vertical" className="w-full" size="middle">
                <div className={`text-${category.color}-600`}>
                  {category.icon}
                </div>
                <div>
                  <Title level={4} className="mb-1">
                    {category.title}
                  </Title>
                  <Text type="secondary" className="text-sm">
                    {category.description}
                  </Text>
                </div>
                <Button
                  type="link"
                  icon={<ArrowRightOutlined />}
                  className="p-0 text-blue-600"
                >
                  Configure
                </Button>
              </Space>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
