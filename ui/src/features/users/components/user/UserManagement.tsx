import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Typography, 
  message, 
  Space, 
  Tag, 
  Popconfirm, 
  Row, 
  Col,
  Input,
  Select,
  Tooltip,
  Alert
} from 'antd';
import { 
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { Form } from 'antd';
import { useUsers } from './hooks/useUsers';
import { useUserOperations } from './hooks/useUserMutations';
import { UserStats } from './components/UserStats';
import { UserModal } from './components/UserModal';
import { UserDetailsModal } from './components/UserDetailsModal';
import type { User, UserFilters } from './types/user.types';

const { Title, Text } = Typography;
const { Option } = Select;

export const UserManagement: React.FC = () => {
  const [userForm] = Form.useForm();
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [userDetailsVisible, setUserDetailsVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    role: 'all'
  });

  const { data: users, isLoading, error, refetch } = useUsers();
  const { 
    updateUserStatus, 
    deleteUser, 
    isUpdatingStatus, 
    isDeleting 
  } = useUserOperations();

  const openUserModal = (user?: User) => {
    setEditingUser(user || null);
    if (user) {
      userForm.setFieldsValue({
        email: user.email,
        roles: user.roles,
        status: user.status,
      });
    } else {
      userForm.resetFields();
    }
    setUserModalVisible(true);
  };

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setUserDetailsVisible(true);
  };

  const handleStatusChange = async (userId: string, newStatus: 'pending' | 'active' | 'rejected' | 'blocked') => {
    try {
      await updateUserStatus({ id: userId, status: newStatus });
      message.success('User status updated successfully');
    } catch {
      message.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      message.success('User deleted successfully');
    } catch {
      message.error('Failed to delete user');
    }
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = !filters.search || 
      user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || user.status === filters.status;
    const matchesRole = filters.role === 'all' || user.roles.includes(filters.role || '');
    
    return matchesSearch && matchesStatus && matchesRole;
  }) || [];

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
      case 'blocked': return <StopOutlined />;
      case 'rejected': return <UserOutlined />;
      default: return <UserOutlined />;
    }
  };

  const userColumns = [
    {
      title: 'User',
      key: 'user',
      render: (user: User) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <UserOutlined className="text-white text-lg" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.username}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Roles',
      key: 'roles',
      render: (user: User) => (
        <Space wrap>
          {user.roles.map((role) => (
            <Tag 
              key={`${user.id}-${role}`} 
              color={role === 'admin' ? 'red' : role === 'super-admin' ? 'purple' : 'blue'}
              icon={role === 'admin' ? <CrownOutlined /> : <TeamOutlined />}
              className="rounded-lg px-3 py-1 font-medium"
            >
              {role}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (user: User) => (
        <Tag 
          color={getStatusColor(user.status)}
          icon={getStatusIcon(user.status)}
          className="rounded-lg px-4 py-2 font-medium"
        >
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      key: 'lastLogin',
      render: (user: User) => (
        <div className="text-sm text-gray-600">
          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
        </div>
      ),
    },
    {
      title: 'Member Since',
      key: 'createdAt',
      render: (user: User) => (
        <div className="text-sm text-gray-600">
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (user: User) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => openUserDetails(user)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            />
          </Tooltip>
          
          <Tooltip title="Edit User">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => openUserModal(user)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            />
          </Tooltip>
          
          <Tooltip title="Change Status">
            <Select
              value={user.status}
              onChange={(value) => handleStatusChange(user.id, value)}
              size="small"
              className="w-24"
              loading={isUpdatingStatus}
            >
              <Option value="active">Active</Option>
              <Option value="pending">Pending</Option>
              <Option value="blocked">Blocked</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Tooltip>

          <Tooltip title="Delete User">
            <Popconfirm
              title="Delete this user?"
              description="This action cannot be undone."
              onConfirm={() => handleDeleteUser(user.id)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okType="danger"
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                className="hover:bg-red-50"
                loading={isDeleting}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <Alert
          message="Error Loading Users"
          description="Failed to load user data. Please try again."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={1} className="text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            User Management
          </Title>
          <Text className="text-gray-600 text-lg">
            Manage user accounts, roles, and permissions
          </Text>
        </div>

        {/* Statistics Cards */}
        <UserStats />

        {/* Controls and Filters */}
        <Card className="mb-6 shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
          <Row gutter={16} align="middle" className="mb-4">
            <Col span={6}>
              <Button 
                type="primary" 
                icon={<UserAddOutlined />}
                onClick={() => openUserModal()}
                size="large"
                className="h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base px-6"
              >
                Add User
              </Button>
            </Col>
            <Col span={6}>
              <Input
                placeholder="Search users..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                size="large"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Filter by status"
                value={filters.status}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                size="large"
                className="w-full rounded-xl"
              >
                <Option value="all">All Statuses</Option>
                <Option value="active">Active</Option>
                <Option value="pending">Pending</Option>
                <Option value="blocked">Blocked</Option>
                <Option value="rejected">Rejected</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Filter by role"
                value={filters.role}
                onChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
                size="large"
                className="w-full rounded-xl"
              >
                <Option value="all">All Roles</Option>
                <Option value="admin">Admin</Option>
                <Option value="user">User</Option>
                <Option value="super-admin">Super Admin</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                size="large"
                className="h-12 rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-500 transition-all duration-200"
              >
                Refresh
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Users Table */}
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
          <Table
            columns={userColumns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
              className: "rounded-xl"
            }}
            className="rounded-xl"
          />
        </Card>

        {/* User Modal */}
        <UserModal
          visible={userModalVisible}
          onCancel={() => {
            setUserModalVisible(false);
            setEditingUser(null);
            userForm.resetFields();
          }}
          editingUser={editingUser}
          form={userForm}
        />

        {/* User Details Modal */}
        <UserDetailsModal
          visible={userDetailsVisible}
          onCancel={() => {
            setUserDetailsVisible(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      </div>
    </div>
  );
};
