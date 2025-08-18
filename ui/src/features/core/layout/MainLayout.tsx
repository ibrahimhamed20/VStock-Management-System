import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  MenuFoldOutlined, MenuUnfoldOutlined, DashboardOutlined, ShoppingOutlined, DollarOutlined,
  ShoppingCartOutlined, BookOutlined, BarChartOutlined, RobotOutlined, UserOutlined,
  SettingOutlined, LogoutOutlined, GlobalOutlined, ProfileOutlined, TeamOutlined,
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
      key: '/inventory',
      icon: <ShoppingOutlined />,
      label: t('navigation.inventory'),
      onClick: () => navigate('/inventory'),
    },
    {
      key: '/sales',
      icon: <DollarOutlined />,
      label: t('navigation.sales'),
      onClick: () => navigate('/sales'),
    },
    {
      key: '/purchasing',
      icon: <ShoppingCartOutlined />,
      label: t('navigation.purchasing'),
      onClick: () => navigate('/purchasing'),
    },
    {
      key: '/accounting',
      icon: <BookOutlined />,
      label: t('navigation.accounting'),
      onClick: () => navigate('/accounting'),
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: t('navigation.reports'),
      onClick: () => navigate('/reports'),
    },
    {
      key: '/ai-agent',
      icon: <RobotOutlined />,
      label: t('navigation.aiAgent'),
      onClick: () => navigate('/ai-agent'),
    },
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

        <Content className="m-6 p-6 bg-gray-50 min-h-screen">
          <div className="bg-white rounded-lg shadow-sm min-h-full">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
