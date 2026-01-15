import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  MenuFoldOutlined, MenuUnfoldOutlined, DashboardOutlined, ShoppingOutlined, DollarOutlined, AccountBookOutlined,
  ShoppingCartOutlined, BookOutlined, BarChartOutlined, UserOutlined,
  SettingOutlined, LogoutOutlined, GlobalOutlined, ProfileOutlined, TeamOutlined,
  InboxOutlined, HistoryOutlined, FileTextOutlined, BarcodeOutlined, CheckCircleOutlined,
  UsergroupAddOutlined,
  NumberOutlined,
  BankOutlined,
  CalendarOutlined,
  MailOutlined,
  PrinterOutlined,
  LockOutlined,
  BellOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useAuthUser, useIsAdmin } from '@auth/stores';
import { AuthService } from '@auth/services';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuthStore();
  const user = useAuthUser();
  const isAdmin = useIsAdmin();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      logout();
      navigate('/login');
    }
  };

  const handleLanguageChange = (language: string) => {
    // Update i18n language
    window.location.href = `/${language}${location.pathname}`;
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Profile Settings',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const languageMenuItems = [
    {
      key: 'en',
      label: 'English',
      onClick: () => handleLanguageChange('en'),
    },
    {
      key: 'ar',
      label: 'العربية',
      onClick: () => handleLanguageChange('ar'),
    },
  ];

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('navigation.dashboard'),
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'inventory',
      icon: <ShoppingOutlined />,
      label: t('navigation.inventory'),
      children: [
        {
          key: '/inventory',
          icon: <BarcodeOutlined />,
          label: 'Products',
          onClick: () => navigate('/inventory'),
        },
        {
          key: '/inventory/stock',
          icon: <InboxOutlined />,
          label: 'Stock Management',
          onClick: () => navigate('/inventory/stock'),
        },
        {
          key: '/inventory/batches',
          icon: <FileTextOutlined />,
          label: 'Batch Management',
          onClick: () => navigate('/inventory/batches'),
        },
        {
          key: '/inventory/movements',
          icon: <HistoryOutlined />,
          label: 'Stock Movements',
          onClick: () => navigate('/inventory/movements'),
        },
        {
          key: '/inventory/reports',
          icon: <BarChartOutlined />,
          label: 'Inventory Reports',
          onClick: () => navigate('/inventory/reports'),
        },
      ],
    },
    {
      key: 'sales',
      icon: <DollarOutlined />,
      label: t('navigation.sales'),
      children: [
        {
          key: '/sales',
          icon: <BarChartOutlined />,
          label: 'Dashboard',
          onClick: () => navigate('/sales'),
        },
        {
          key: '/sales/invoices',
          icon: <FileTextOutlined />,
          label: 'Invoice Management',
          onClick: () => navigate('/sales/invoices'),
        },
        {
          key: '/sales/payments',
          icon: <DollarOutlined />,
          label: 'Payment Management',
          onClick: () => navigate('/sales/payments'),
        },
        {
          key: '/sales/reports',
          icon: <BarChartOutlined />,
          label: 'Sales Reports',
          onClick: () => navigate('/sales/reports'),
        },
      ],
    },
    {
      key: '/clients',
      icon: <UsergroupAddOutlined />,
      label: 'Clients',
      onClick: () => navigate('/clients'),
    },
    {
      key: 'purchasing',
      icon: <ShoppingCartOutlined />,
      label: t('navigation.purchasing'),
      children: [
        {
          key: '/purchasing',
          icon: <BarChartOutlined />,
          label: 'Dashboard',
          onClick: () => navigate('/purchasing'),
        },
        {
          key: '/purchasing/orders',
          icon: <FileTextOutlined />,
          label: 'Purchase Orders',
          onClick: () => navigate('/purchasing/orders'),
        },
        {
          key: '/purchasing/suppliers',
          icon: <UserOutlined />,
          label: 'Suppliers',
          onClick: () => navigate('/purchasing/suppliers'),
        },
        {
          key: '/purchasing/reports',
          icon: <BarChartOutlined />,
          label: 'Reports',
          onClick: () => navigate('/purchasing/reports'),
        },
      ],
    },
    {
      key: 'accounting',
      icon: <BookOutlined />,
      label: t('navigation.accounting'),
      children: [
        {
          key: '/accounting',
          icon: <BarChartOutlined />,
          label: 'Dashboard',
          onClick: () => navigate('/accounting'),
        },
        {
          key: '/accounting/accounts',
          icon: <AccountBookOutlined />,
          label: 'Chart of Accounts',
          onClick: () => navigate('/accounting/accounts'),
        },
        {
          key: '/accounting/journal-entries',
          icon: <FileTextOutlined />,
          label: 'Journal Entries',
          onClick: () => navigate('/accounting/journal-entries'),
        },
        {
          key: '/accounting/reports',
          icon: <BarChartOutlined />,
          label: 'Financial Reports',
          onClick: () => navigate('/accounting/reports'),
        },
        {
          key: '/accounting/reconciliation',
          icon: <CheckCircleOutlined />,
          label: 'Account Reconciliation',
          onClick: () => navigate('/accounting/reconciliation'),
        },
      ],
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      children: [
        {
          key: '/settings/basic',
          icon: <SettingOutlined />,
          label: 'Basic Settings',
          onClick: () => navigate('/settings/basic'),
        },
        {
          key: '/settings/company',
          icon: <BankOutlined />,
          label: 'Company Information',
          onClick: () => navigate('/settings/company'),
        },
        {
          key: '/settings/invoice',
          icon: <FileTextOutlined />,
          label: 'Invoice Settings',
          onClick: () => navigate('/settings/invoice'),
        },
        {
          key: '/settings/datetime',
          icon: <CalendarOutlined />,
          label: 'Date & Time',
          onClick: () => navigate('/settings/datetime'),
        },
        {
          key: '/settings/inventory',
          icon: <ShoppingOutlined />,
          label: 'Inventory Settings',
          onClick: () => navigate('/settings/inventory'),
        },
        {
          key: '/settings/email',
          icon: <MailOutlined />,
          label: 'Email/SMTP',
          onClick: () => navigate('/settings/email'),
        },
        {
          key: '/settings/print',
          icon: <PrinterOutlined />,
          label: 'Print/Export',
          onClick: () => navigate('/settings/print'),
        },
        {
          key: '/settings/number-format',
          icon: <NumberOutlined />,
          label: 'Number Format',
          onClick: () => navigate('/settings/number-format'),
        },
        {
          key: '/settings/security',
          icon: <LockOutlined />,
          label: 'Security',
          onClick: () => navigate('/settings/security'),
        },
        {
          key: '/settings/notifications',
          icon: <BellOutlined />,
          label: 'Notifications',
          onClick: () => navigate('/settings/notifications'),
        },
        {
          key: '/settings/backup',
          icon: <DatabaseOutlined />,
          label: 'Backup',
          onClick: () => navigate('/settings/backup'),
        },
        {
          key: '/settings/business-hours',
          icon: <ClockCircleOutlined />,
          label: 'Business Hours',
          onClick: () => navigate('/settings/business-hours'),
        },
      ],
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: t('navigation.reports'),
      onClick: () => navigate('/reports'),
    },
    // AI Agent - Coming Soon
    // {
    //   key: '/ai-agent',
    //   icon: <RobotOutlined />,
    //   label: t('navigation.aiAgent'),
    //   onClick: () => navigate('/ai-agent'),
    // },
    // Admin section
    ...(isAdmin ? [{
      key: 'admin',
      icon: <TeamOutlined />,
      label: 'Administration',
      children: [
        {
          key: '/admin/users',
          icon: <UserOutlined />,
          label: 'User Management',
          onClick: () => navigate('/admin/users'),
        },
        {
          key: '/admin/roles',
          icon: <TeamOutlined />,
          label: 'Role Management',
          onClick: () => navigate('/admin/roles'),
        },
        {
          key: '/admin/permissions',
          icon: <SettingOutlined />,
          label: 'Permission Management',
          onClick: () => navigate('/admin/permissions'),
        },
      ],
    }] : []),
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('navigation.settings'),
      onClick: () => navigate('/settings'),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white border-r border-gray-200"
        width={280}
      >
        <div className="p-4 border-b border-gray-200">
          <Title level={4} className="text-center m-0">
            {collapsed ? 'SA' : 'Store Admin'}
          </Title>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="border-0"
        />
      </Sider>

      <Layout>
        <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="mr-4"
            />
            <Title level={4} className="m-0">
              {menuItems.find(item => item.key === location.pathname)?.label || 'Dashboard'}
            </Title>
          </div>

          <Space size="middle">
            {/* Language Selector */}
            <Dropdown
              menu={{ items: languageMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button type="text" icon={<GlobalOutlined />}>
                {t('common.language')}
              </Button>
            </Dropdown>

            {/* User Menu */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Space className="cursor-pointer">
                <Avatar
                  icon={<UserOutlined />}
                  className="bg-primary-600"
                />
                <div className="hidden md:block text-left">
                  <div className="font-medium">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.username
                    }
                  </div>
                  <div className="text-sm text-gray-500">
                    {user?.roles.join(', ')}
                  </div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content className="m-6 p-6 bg-gray-50 shadow-sm min-h-screen rounded-lg">
          <div className="min-h-full">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
