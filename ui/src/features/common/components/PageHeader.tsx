import React from 'react';
import { Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; path: string }>;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
}) => {

  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          className="mb-4"
          items={[
            {
              title: <HomeOutlined />,
              href: '/',
            },
            ...breadcrumbs.map((item, index) => ({
              title: item.label,
              href: item.path,
              key: index,
            })),
          ]}
        />
      )}

      {/* Header Content */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Title level={2} className="mb-2">
            {title}
          </Title>
          {subtitle && (
            <Text type="secondary" className="text-lg">
              {subtitle}
            </Text>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="ml-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
