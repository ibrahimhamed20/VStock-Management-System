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
  Tooltip,
  Descriptions
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  KeyOutlined,
  ReloadOutlined,
  EyeOutlined,
  DatabaseOutlined,
  ApiOutlined
} from '@ant-design/icons';
import { AuthService } from '@auth/services';
import type { Permission } from '@auth/types';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [permissionForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const permissionsData = await AuthService.getPermissions();
      setPermissions(permissionsData || []);
    } catch (error) {
      message.error('Failed to fetch permissions');
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPermissionModal = (permission?: Permission) => {
    setEditingPermission(permission || null);
    if (permission) {
      permissionForm.setFieldsValue({
        name: permission.name,
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
      });
    } else {
      permissionForm.resetFields();
    }
    setPermissionModalVisible(true);
  };

  const handleSavePermission = async (values: any) => {
    try {
      if (editingPermission) {
        await AuthService.updatePermission(editingPermission.id, values);
        message.success('Permission updated successfully');
      } else {
        await AuthService.createPermission(values);
        message.success('Permission created successfully');
      }
      setPermissionModalVisible(false);
      fetchPermissions();
    } catch (error) {
      message.error('Failed to save permission');
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    try {
      await AuthService.deletePermission(permissionId);
      message.success('Permission deleted successfully');
      fetchPermissions();
    } catch (error) {
      message.error('Failed to delete permission');
    }
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (permission.description && permission.description.toLowerCase().includes(searchText.toLowerCase()));
    const matchesResource = resourceFilter === 'all' || permission.resource === resourceFilter;

    return matchesSearch && matchesResource;
  });

  const uniqueResources = Array.from(new Set(permissions.map(p => p.resource)));

  const permissionColumns = [
    {
      title: 'Permission',
      key: 'permission',
      render: (permission: Permission) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <KeyOutlined className="text-white text-lg" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{permission.name}</div>
            <div className="text-sm text-gray-500">{permission.description || 'No description'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Resource',
      key: 'resource',
      render: (permission: Permission) => (
        <Tag
          color="blue"
          icon={<DatabaseOutlined />}
          className="rounded-lg px-3 py-1 font-medium"
        >
          {permission.resource}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (permission: Permission) => (
        <Tag
          color="green"
          icon={<ApiOutlined />}
          className="rounded-lg px-3 py-1 font-medium"
        >
          {permission.action}
        </Tag>
      ),
    },
    {
      title: 'Usage Count',
      key: 'usageCount',
      render: (permission: Permission) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">
            {/* TODO: Replace with actual backend data when available */}
            {permission.name.includes('read') ? '5' : permission.name.includes('write') ? '3' : '2'}
          </div>
          <div className="text-xs text-gray-500">roles</div>
        </div>
      ),
    },
    {
      title: 'Created',
      key: 'createdAt',
      render: (permission: Permission) => (
        <div className="text-sm text-gray-600">
          {new Date(permission.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (permission: Permission) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setSelectedPermission(permission)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            />
          </Tooltip>

          <Tooltip title="Edit Permission">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openPermissionModal(permission)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            />
          </Tooltip>

          <Tooltip title="Delete Permission">
            <Popconfirm
              title="Delete this permission?"
              description="This action cannot be undone and may affect roles using this permission."
              onConfirm={() => handleDeletePermission(permission.id)}
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
    totalPermissions: permissions.length,
    resourceTypes: uniqueResources.length,
    readPermissions: permissions.filter(p => p.action === 'read').length,
    writePermissions: permissions.filter(p => p.action === 'write' || p.action === 'create' || p.action === 'update' || p.action === 'delete').length,
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
            Permission Management
          </Title>
          <Text className="text-gray-600 text-lg">
            Manage system permissions and access controls
          </Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16} className="mb-8">
          <Col span={6}>
            <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
              <Statistic
                title="Total Permissions"
                value={stats.totalPermissions}
                prefix={<KeyOutlined className="text-purple-500" />}
                className="text-center"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
              <Statistic
                title="Resource Types"
                value={stats.resourceTypes}
                prefix={<DatabaseOutlined className="text-blue-500" />}
                className="text-center"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
              <Statistic
                title="Read Permissions"
                value={stats.readPermissions}
                prefix={<EyeOutlined className="text-green-500" />}
                className="text-center"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
              <Statistic
                title="Write Permissions"
                value={stats.writePermissions}
                prefix={<ApiOutlined className="text-orange-500" />}
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
                icon={<PlusOutlined />}
                onClick={() => openPermissionModal()}
                size="large"
                className="h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base px-6"
              >
                Create Permission
              </Button>
            </Col>
            <Col span={8}>
              <Input
                placeholder="Search permissions..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="large"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="Filter by resource"
                value={resourceFilter}
                onChange={setResourceFilter}
                size="large"
                className="w-full rounded-xl"
              >
                <Option value="all">All Resources</Option>
                {uniqueResources.map(resource => (
                  <Option key={resource} value={resource}>{resource}</Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchPermissions}
                size="large"
                className="h-12 rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-500 transition-all duration-200"
              >
                Refresh
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Permissions Table */}
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
          <Table
            columns={permissionColumns}
            dataSource={filteredPermissions}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} permissions`,
              className: "rounded-xl"
            }}
            className="rounded-xl"
            onRow={(permission) => ({
              onClick: () => setSelectedPermission(permission),
              className: 'cursor-pointer hover:bg-gray-50 transition-colors'
            })}
          />
        </Card>

        {/* Permission Modal */}
        <Modal
          title={
            <div className="text-center">
              <Title level={3} className="mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {editingPermission ? 'Edit Permission' : 'Create New Permission'}
              </Title>
            </div>
          }
          open={permissionModalVisible}
          onCancel={() => {
            setPermissionModalVisible(false);
            setEditingPermission(null);
            permissionForm.resetFields();
          }}
          footer={null}
          width={600}
          className="rounded-2xl"
        >
          <Form
            form={permissionForm}
            layout="vertical"
            onFinish={handleSavePermission}
            className="space-y-6"
          >
            <Form.Item
              name="name"
              label={<span className="text-gray-700 font-medium">Permission Name</span>}
              rules={[{ required: true, message: 'Permission name is required' }]}
            >
              <Input
                size="large"
                prefix={<KeyOutlined className="text-gray-400" />}
                placeholder="Enter permission name"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={<span className="text-gray-700 font-medium">Description</span>}
            >
              <TextArea
                rows={3}
                placeholder="Enter permission description"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="resource"
                  label={<span className="text-gray-700 font-medium">Resource</span>}
                  rules={[{ required: true, message: 'Resource is required' }]}
                >
                  <Select
                    placeholder="Select resource"
                    size="large"
                    className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
                  >
                    <Option value="users">Users</Option>
                    <Option value="roles">Roles</Option>
                    <Option value="permissions">Permissions</Option>
                    <Option value="inventory">Inventory</Option>
                    <Option value="sales">Sales</Option>
                    <Option value="purchasing">Purchasing</Option>
                    <Option value="accounting">Accounting</Option>
                    <Option value="reports">Reports</Option>
                    <Option value="settings">Settings</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="action"
                  label={<span className="text-gray-700 font-medium">Action</span>}
                  rules={[{ required: true, message: 'Action is required' }]}
                >
                  <Select
                    placeholder="Select action"
                    size="large"
                    className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
                  >
                    <Option value="read">Read</Option>
                    <Option value="create">Create</Option>
                    <Option value="update">Update</Option>
                    <Option value="delete">Delete</Option>
                    <Option value="write">Write</Option>
                    <Option value="manage">Manage</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item className="mb-0 pt-4">
              <div className="flex space-x-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base"
                >
                  {editingPermission ? 'Update Permission' : 'Create Permission'}
                </Button>
                <Button
                  size="large"
                  onClick={() => {
                    setPermissionModalVisible(false);
                    setEditingPermission(null);
                    permissionForm.resetFields();
                  }}
                  className="h-12 rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-500 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Permission Details Modal */}
        <Modal
          title={
            <div className="text-center">
              <Title level={3} className="mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Permission Details
              </Title>
            </div>
          }
          open={!!selectedPermission}
          onCancel={() => setSelectedPermission(null)}
          footer={null}
          width={700}
          className="rounded-2xl"
        >
          {selectedPermission && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg rounded-xl">
                <Descriptions title="Permission Information" column={1} bordered>
                  <Descriptions.Item label="Name">
                    <Tag color="purple" className="text-lg px-3 py-1 rounded-lg">
                      {selectedPermission.name}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Description">
                    {selectedPermission.description || 'No description provided'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Resource">
                    <Tag color="blue" icon={<DatabaseOutlined />} className="px-3 py-1 rounded-lg">
                      {selectedPermission.resource}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Action">
                    <Tag color="green" icon={<ApiOutlined />} className="px-3 py-1 rounded-lg">
                      {selectedPermission.action}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Created">
                    {new Date(selectedPermission.createdAt).toLocaleDateString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Updated">
                    {new Date(selectedPermission.updatedAt).toLocaleDateString()}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedPermission(null);
                    openPermissionModal(selectedPermission);
                  }}
                  className="rounded-xl"
                >
                  Edit Permission
                </Button>
                <Button
                  onClick={() => setSelectedPermission(null)}
                  className="rounded-xl"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
