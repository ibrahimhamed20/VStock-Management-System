import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Card, 
  Typography, 
  message, 
  Space, 
  Tag, 
  Popconfirm, 
  Row, 
  Col,
  Statistic,
  Tooltip
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
  ReloadOutlined
} from '@ant-design/icons';
import { AuthService } from '@auth/services';
import type { User, Role } from '@auth/types';

const { Title, Text } = Typography;
const { Option } = Select;

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await AuthService.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      message.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await AuthService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const openUserModal = (user?: User) => {
    setEditingUser(user || null);
    if (user) {
      userForm.setFieldsValue({
        username: user.username,
        email: user.email,
        roles: user.roles,
        status: user.status,
      });
    } else {
      userForm.resetFields();
    }
    setUserModalVisible(true);
  };

  const handleSaveUser = async (values: any) => {
    try {
      if (editingUser) {
        await AuthService.updateUser(editingUser.id, values);
        message.success('User updated successfully');
      } else {
        // Note: createUser would need to be implemented in AuthService
        message.info('Create user functionality needs backend implementation');
      }
      setUserModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Failed to save user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await AuthService.deleteUser(userId);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'blocked' | 'inactive') => {
    try {
      await AuthService.updateUser(userId, { status: newStatus });
      message.success('User status updated successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
    
    return matchesSearch && matchesStatus && matchesRole;
  });

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
            <div className="font-medium text-gray-900">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.username
              }
            </div>
            <div className="text-sm text-gray-500">@{user.username}</div>
            <div className="text-sm text-gray-400">{user.email}</div>
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
          color={user.status === 'active' ? 'green' : user.status === 'blocked' ? 'red' : 'orange'}
          icon={<SafetyCertificateOutlined />}
          className="rounded-lg px-4 py-2 font-medium"
        >
          {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
        </Tag>
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
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="blocked">Blocked</Option>
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
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    adminUsers: users.filter(u => u.roles.includes('admin')).length,
    blockedUsers: users.filter(u => u.status === 'blocked').length,
  };

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
        <Row gutter={16} className="mb-8">
          <Col span={6}>
            <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
              <Statistic 
                title="Total Users" 
                value={stats.totalUsers} 
                prefix={<UserOutlined className="text-blue-500" />}
                className="text-center"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
              <Statistic 
                title="Active Users" 
                value={stats.activeUsers} 
                prefix={<SafetyCertificateOutlined className="text-green-500" />}
                className="text-center"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
              <Statistic 
                title="Admin Users" 
                value={stats.adminUsers} 
                prefix={<CrownOutlined className="text-red-500" />}
                className="text-center"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
              <Statistic 
                title="Blocked Users" 
                value={stats.blockedUsers} 
                prefix={<UserOutlined className="text-orange-500" />}
                className="text-center"
              />
            </Card>
          </Col>
        </Row>

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
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="large"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={setStatusFilter}
                size="large"
                className="w-full rounded-xl"
              >
                <Option value="all">All Statuses</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="blocked">Blocked</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Filter by role"
                value={roleFilter}
                onChange={setRoleFilter}
                size="large"
                className="w-full rounded-xl"
              >
                <Option value="all">All Roles</Option>
                {roles.map(role => (
                  <Option key={role.id} value={role.name}>{role.name}</Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchUsers}
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
            loading={loading}
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
        <Modal
          title={
            <div className="text-center">
              <Title level={3} className="mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {editingUser ? 'Edit User' : 'Create New User'}
              </Title>
            </div>
          }
          open={userModalVisible}
          onCancel={() => {
            setUserModalVisible(false);
            setEditingUser(null);
            userForm.resetFields();
          }}
          footer={null}
          width={600}
          className="rounded-2xl"
        >
          <Form
            form={userForm}
            layout="vertical"
            onFinish={handleSaveUser}
            className="space-y-6"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="username"
                  label={<span className="text-gray-700 font-medium">Username</span>}
                  rules={[{ required: true, message: 'Username is required' }]}
                >
                  <Input 
                    size="large"
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Enter username"
                    className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label={<span className="text-gray-700 font-medium">Email</span>}
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input 
                    size="large"
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Enter email"
                    className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="roles"
              label={<span className="text-gray-700 font-medium">Roles</span>}
              rules={[{ required: true, message: 'At least one role is required' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select roles"
                size="large"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              >
                {roles.map(role => (
                  <Option key={role.id} value={role.name}>
                    <div className="flex items-center space-x-2">
                      {role.name === 'admin' ? <CrownOutlined className="text-red-500" /> : <TeamOutlined className="text-blue-500" />}
                      <span>{role.name}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label={<span className="text-gray-700 font-medium">Status</span>}
              rules={[{ required: true, message: 'Status is required' }]}
            >
              <Select
                placeholder="Select status"
                size="large"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              >
                <Option value="active">
                  <div className="flex items-center space-x-2">
                    <SafetyCertificateOutlined className="text-green-500" />
                    <span>Active</span>
                  </div>
                </Option>
                <Option value="inactive">
                  <div className="flex items-center space-x-2">
                    <UserOutlined className="text-orange-500" />
                    <span>Inactive</span>
                  </div>
                </Option>
                <Option value="blocked">
                  <div className="flex items-center space-x-2">
                    <UserOutlined className="text-red-500" />
                    <span>Blocked</span>
                  </div>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item className="mb-0 pt-4">
              <div className="flex space-x-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
                <Button
                  size="large"
                  onClick={() => {
                    setUserModalVisible(false);
                    setEditingUser(null);
                    userForm.resetFields();
                  }}
                  className="h-12 rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-500 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};
