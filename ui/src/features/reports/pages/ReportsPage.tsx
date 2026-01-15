import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import {
  BarChartOutlined,
  DollarOutlined,
  ShoppingOutlined,
  AccountBookOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const REPORT_CATEGORIES = [
  {
    key: 'financial',
    title: 'Financial Reports',
    description: 'Balance Sheet, Income Statement, and Cash Flow reports',
    icon: <AccountBookOutlined className="text-2xl" />,
    path: '/reports/financial',
    color: 'blue',
  },
  {
    key: 'sales',
    title: 'Sales Reports',
    description: 'Sales performance, revenue analysis, and customer insights',
    icon: <DollarOutlined className="text-2xl" />,
    path: '/sales/reports',
    color: 'green',
  },
  {
    key: 'purchasing',
    title: 'Purchasing Reports',
    description: 'Purchase orders, supplier performance, and procurement analytics',
    icon: <ShoppingOutlined className="text-2xl" />,
    path: '/purchasing/reports',
    color: 'orange',
  },
  {
    key: 'inventory',
    title: 'Inventory Reports',
    description: 'Stock levels, movements, batches, and inventory analytics',
    icon: <BarChartOutlined className="text-2xl" />,
    path: '/inventory/reports',
    color: 'purple',
  },
];

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <Card className="shadow-lg border-0 rounded-xl w-full mx-auto">
        <Space className="mb-6">
          <BarChartOutlined className="text-3xl text-blue-600" />
          <div>
            <Title level={2} className="mb-0">
              Reports & Analytics
            </Title>
            <Text type="secondary">Access comprehensive business reports and analytics</Text>
          </div>
        </Space>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
          {REPORT_CATEGORIES.map((category) => (
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
                  View Reports
                </Button>
              </Space>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

