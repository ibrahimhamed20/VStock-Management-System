import React from 'react';
import { Modal, Descriptions, Tag, Space, Typography, Collapse, List, Avatar } from 'antd';
import { 
  UserOutlined, 
  CrownOutlined, 
  TeamOutlined, 
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useUserLoginHistory } from '../hooks/useUsers';
import type { User } from '../types/user.types';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface UserDetailsModalProps {
  visible: boolean;
  onCancel: () => void;
  user: User | null;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  visible,
  onCancel,
  user,
}) => {
  const { data: loginHistory, isLoading: isLoadingHistory } = useUserLoginHistory(user?.id || '');

  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'yellow';
      case 'blocked': return 'red';
      case 'rejected': return 'orange';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <SafetyCertificateOutlined />;
      case 'pending': return <ClockCircleOutlined />;
      case 'blocked': return <UserOutlined />;
      case 'rejected': return <UserOutlined />;
      default: return <UserOutlined />;
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            className="bg-gradient-to-br from-blue-500 to-purple-600"
          />
          <div>
            <Title level={4} className="mb-0">
              {user.username}
            </Title>
            <Text type="secondary">{user.email}</Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      className="rounded-2xl"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <Title level={5} className="mb-3">Basic Information</Title>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Username">
              <Text strong>{user.username}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Text>{user.email}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag 
                color={getStatusColor(user.status)} 
                icon={getStatusIcon(user.status)}
                className="rounded-lg px-3 py-1 font-medium"
              >
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Last Login">
              {user.lastLogin ? (
                <Text>{new Date(user.lastLogin).toLocaleString()}</Text>
              ) : (
                <Text type="secondary">Never</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              <Text>{new Date(user.createdAt).toLocaleDateString()}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              <Text>{new Date(user.updatedAt).toLocaleDateString()}</Text>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Roles */}
        <div>
          <Title level={5} className="mb-3">Roles & Permissions</Title>
          <Space wrap>
            {user.roles.map((role) => (
              <Tag 
                key={role} 
                color={role === 'admin' ? 'red' : role === 'super-admin' ? 'purple' : 'blue'}
                icon={role === 'admin' ? <CrownOutlined /> : <TeamOutlined />}
                className="rounded-lg px-3 py-1 font-medium"
              >
                {role}
              </Tag>
            ))}
          </Space>
        </div>

        {/* Login History */}
        <div>
          <Title level={5} className="mb-3">Login History</Title>
          <Collapse size="small">
            <Panel 
              header={`Recent Logins (${loginHistory?.length || 0})`} 
              key="login-history"
            >
              {isLoadingHistory ? (
                <div className="text-center py-4">
                  <Text type="secondary">Loading login history...</Text>
                </div>
              ) : loginHistory && loginHistory.length > 0 ? (
                <List
                  size="small"
                  dataSource={loginHistory.slice(0, 10)} // Show last 10 logins
                  renderItem={(login) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar size="small" icon={<GlobalOutlined />} />}
                        title={
                          <div className="flex justify-between">
                            <Text strong>{new Date(login.loginAt).toLocaleString()}</Text>
                            {login.ipAddress && (
                              <Text type="secondary" className="text-xs">
                                {login.ipAddress}
                              </Text>
                            )}
                          </div>
                        }
                        description={
                          login.userAgent && (
                            <Text type="secondary" className="text-xs">
                              {login.userAgent.length > 50 
                                ? `${login.userAgent.substring(0, 50)}...` 
                                : login.userAgent
                              }
                            </Text>
                          )
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div className="text-center py-4">
                  <Text type="secondary">No login history available</Text>
                </div>
              )}
            </Panel>
          </Collapse>
        </div>
      </div>
    </Modal>
  );
};
