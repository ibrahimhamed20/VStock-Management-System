import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
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
  TreeSelect
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TeamOutlined,
  CrownOutlined,
  ReloadOutlined,
  UserOutlined,
  KeyOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { AuthService } from '../../auth/services/auth.service';
import type { Role, Permission } from '../../auth/types/auth.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // Convert permissions to tree data structure for TreeSelect
  const getPermissionsTreeData = () => {
    // Group permissions by group name (extract from permission name format: groupname.permissionname)
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const [group] = permission.name.split('.');
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(permission);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return Object.entries(groupedPermissions).map(([group, perms]) => ({
      title: (
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
            <DatabaseOutlined className="text-blue-600 text-xs" />
          </div>
          <span className="font-medium capitalize">{group} Permissions</span>
          <span className="text-xs text-gray-500">({perms.length})</span>
        </div>
      ),
      key: `group-${group}`,
      value: `group-${group}`,
      children: perms.map(permission => {
        const [, action] = permission.name.split('.');
        return {
          title: (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <KeyOutlined className="text-white text-xs" />
              </div>
              <span className="font-medium">{action || permission.name}</span>
              {permission.description && (
                <span className="text-xs text-gray-500 ml-2">- {permission.description}</span>
              )}
              {permission.action && (
                <Tag color="green" className="ml-2 text-xs">{permission.action}</Tag>
              )}
            </div>
          ),
          key: permission.name,
          value: permission.name,
          isLeaf: true,
        };
      }),
    }));
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const rolesData = await AuthService.getRoles();
      setRoles(rolesData || []);
    } catch (error) {
      message.error('Failed to fetch roles');
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const permissionsData = await AuthService.getPermissions();
      setPermissions(permissionsData || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const openRoleModal = (role?: Role) => {
    setEditingRole(role || null);
    if (role) {
      // Convert actual permission names to selection format for the form
      const selectedPermissions = role.permissions.map(p => p.name);
      
      setSelectedPermissions(selectedPermissions);
      roleForm.setFieldsValue({
        name: role.name,
        description: role.description,
        permissions: selectedPermissions,
      });
    } else {
      setSelectedPermissions([]);
      roleForm.resetFields();
    }
    setRoleModalVisible(true);
  };

  const handleSaveRole = async (values: any) => {
    try {
      if (editingRole) {
        await AuthService.updateRole(editingRole.id, { ...values, permissions: selectedPermissions });
        message.success('Role updated successfully');
      } else {
        await AuthService.createRole({ ...values, permissions: selectedPermissions });
        message.success('Role created successfully');
      }
      setRoleModalVisible(false);
      setSelectedPermissions([]);
      fetchRoles();
    } catch (error) {
      message.error('Failed to save role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await AuthService.deleteRole(roleId);
      message.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      message.error('Failed to delete role');
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  const roleColumns = [
    {
      title: 'Role',
      key: 'role',
      render: (role: Role) => (
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${role.name === 'admin' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
              role.name === 'super-admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
                'bg-gradient-to-br from-blue-500 to-cyan-600'
            }`}>
            {role.name === 'admin' ? <CrownOutlined className="text-white text-lg" /> : <TeamOutlined className="text-white text-lg" />}
          </div>
          <div>
            <div className="font-medium text-gray-900">{role.name}</div>
            <div className="text-sm text-gray-500">{role.description || 'No description'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (role: Role) => {
        // Group permissions by resource (extract from permission name format: groupname.permissionname)
        const groupedPermissions = role.permissions.reduce((acc, permission) => {
          const [group] = permission.name.split('.');
          if (!acc[group]) {
            acc[group] = [];
          }
          acc[group].push(permission);
          return acc;
        }, {} as Record<string, typeof role.permissions>);

        return (
          <div className="space-y-2">
            {Object.entries(groupedPermissions).slice(0, 2).map(([group, perms]) => (
              <div key={group} className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DatabaseOutlined className="text-blue-600 text-xs" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-700 capitalize">{group}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {perms.slice(0, 3).map((permission) => {
                      const [, action] = permission.name.split('.');
                      return (
                        <Tag
                          key={`${role.id}-${permission.id}`}
                          color="blue"
                          icon={<KeyOutlined />}
                          className="rounded-md px-2 py-0.5 text-xs"
                        >
                          {action || permission.name}
                        </Tag>
                      );
                    })}
                    {perms.length > 3 && (
                      <Tag color="default" className="rounded-md px-2 py-0.5 text-xs">
                        +{perms.length - 3}
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(groupedPermissions).length > 2 && (
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-center">
                +{Object.keys(groupedPermissions).length - 2} more groups
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Users Count',
      key: 'usersCount',
      render: (role: Role) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">
            {/* TODO: Replace with actual backend data when available */}
            {role.name === 'admin' ? '2' : role.name === 'super-admin' ? '1' : '8'}
          </div>
          <div className="text-xs text-gray-500">users</div>
        </div>
      ),
    },
    {
      title: 'Created',
      key: 'createdAt',
      render: (role: Role) => (
        <div className="text-sm text-gray-600">
          {new Date(role.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (role: Role) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<UserOutlined />}
              onClick={() => setSelectedRole(role)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            />
          </Tooltip>

          <Tooltip title="Edit Role">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openRoleModal(role)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            />
          </Tooltip>

          <Tooltip title="Delete Role">
            <Popconfirm
              title="Delete this role?"
              description="This action cannot be undone and may affect users with this role."
              onConfirm={() => handleDeleteRole(role.id)}
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
    totalRoles: roles.length,
    adminRoles: roles.filter(r => r.name.includes('admin')).length,
    customRoles: roles.filter(r => !r.name.includes('admin')).length,
    totalPermissions: permissions.length,
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
            Role Management
          </Title>
          <Text className="text-gray-600 text-lg">
            Manage user roles and their associated permissions
          </Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16} className="mb-8">
          <Col span={6}>
            <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
              <Statistic
                title="Total Roles"
                value={stats.totalRoles}
                prefix={<TeamOutlined className="text-blue-500" />}
                className="text-center"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
              <Statistic
                title="Admin Roles"
                value={stats.adminRoles}
                prefix={<CrownOutlined className="text-red-500" />}
                className="text-center"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
              <Statistic
                title="Custom Roles"
                value={stats.customRoles}
                prefix={<TeamOutlined className="text-green-500" />}
                className="text-center"
              />
            </Card>
          </Col>
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
        </Row>

        {/* Controls and Filters */}
        <Card className="mb-6 shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
          <Row gutter={16} align="middle" className="mb-4">
            <Col span={8}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openRoleModal()}
                size="large"
                className="h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base px-6"
              >
                Create Role
              </Button>
            </Col>
            <Col span={12}>
              <Input
                placeholder="Search roles..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="large"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              />
            </Col>
            <Col span={4}>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchRoles}
                size="large"
                className="h-12 rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-500 transition-all duration-200"
              >
                Refresh
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Roles Table */}
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
          <Table
            columns={roleColumns}
            dataSource={filteredRoles}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} roles`,
              className: "rounded-xl"
            }}
            className="rounded-xl"
            onRow={(role) => ({
              onClick: () => setSelectedRole(role),
              className: 'cursor-pointer hover:bg-gray-50 transition-colors'
            })}
          />
        </Card>

        {/* Role Modal */}
        <Modal
          title={
            <div className="text-center">
              <Title level={3} className="mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </Title>
            </div>
          }
          open={roleModalVisible}
          onCancel={() => {
            setRoleModalVisible(false);
            setEditingRole(null);
            setSelectedPermissions([]);
            roleForm.resetFields();
          }}
          footer={null}
          width={600}
          className="rounded-2xl"
        >
          <Form
            form={roleForm}
            layout="vertical"
            onFinish={handleSaveRole}
            className="space-y-6"
          >
            <Form.Item
              name="name"
              label={<span className="text-gray-700 font-medium">Role Name</span>}
              rules={[{ required: true, message: 'Role name is required' }]}
            >
              <Input
                size="large"
                prefix={<TeamOutlined className="text-gray-400" />}
                placeholder="Enter role name"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={<span className="text-gray-700 font-medium">Description</span>}
            >
              <TextArea
                rows={3}
                placeholder="Enter role description"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="permissions"
              label={<span className="text-gray-700 font-medium">Permissions</span>}
              rules={[{ required: true, message: 'At least one permission is required' }]}
            >
              <div className="space-y-4">
                {/* Selected Permissions Count */}
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="font-medium">Selected:</span> {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''}
                </div>
                
                {/* Quick Selection */}
                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <KeyOutlined className="text-white text-xs" />
                    </div>
                    <div className="font-medium text-gray-900">Quick Selection</div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-blue-100 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        onChange={(e) => {
                          const allPermissions = permissions.map(p => p.name);
                          if (e.target.checked) {
                            setSelectedPermissions(allPermissions);
                            roleForm.setFieldValue('permissions', allPermissions);
                          } else {
                            setSelectedPermissions([]);
                            roleForm.setFieldValue('permissions', []);
                          }
                        }}
                        checked={selectedPermissions.length === permissions.length}
                      />
                      <span className="font-medium text-gray-900">Select All Permissions</span>
                      <span className="text-sm text-gray-500">({permissions.length} total)</span>
                    </label>
                  </div>
                </div>

                {/* TreeSelect for Permissions */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <KeyOutlined className="text-white text-xs" />
                    </div>
                    <div className="font-medium text-gray-900">Permission Selection</div>
                  </div>
                  
                  <TreeSelect
                    treeData={getPermissionsTreeData()}
                    value={selectedPermissions}
                    onChange={(value) => {
                      // Filter out group keys and only keep actual permission names
                      const permissionValues = Array.isArray(value) 
                        ? value.filter(v => !v.startsWith('group-'))
                        : [];
                      setSelectedPermissions(permissionValues);
                      roleForm.setFieldValue('permissions', permissionValues);
                    }}
                    multiple
                    treeCheckable
                    showCheckedStrategy={TreeSelect.SHOW_CHILD}
                    placeholder="Select permissions"
                    style={{ width: '100%' }}
                    className="rounded-lg"
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeDefaultExpandAll
                    allowClear
                    showSearch
                    filterTreeNode={(inputValue, treeNode) => {
                      if (treeNode.title && typeof treeNode.title === 'string') {
                        return treeNode.title.toLowerCase().includes(inputValue.toLowerCase());
                      }
                      return false;
                    }}
                  />
                </div>
              </div>
            </Form.Item>

            <Form.Item className="mb-0 pt-4">
              <div className="flex space-x-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base"
                >
                  {editingRole ? 'Update Role' : 'Create Role'}
                </Button>
                <Button
                  size="large"
                  onClick={() => {
                    setRoleModalVisible(false);
                    setEditingRole(null);
                    roleForm.resetFields();
                  }}
                  className="h-12 rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-500 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Role Details Modal */}
        <Modal
          title={
            <div className="text-center">
              <Title level={3} className="mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Role Details
              </Title>
            </div>
          }
          open={!!selectedRole}
          onCancel={() => setSelectedRole(null)}
          footer={null}
          width={800}
          className="rounded-2xl"
        >
          {selectedRole && (
            <div className="space-y-6">
              {/* Role Header Card */}
              <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${selectedRole.name === 'admin' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                      selectedRole.name === 'super-admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
                        'bg-gradient-to-br from-blue-500 to-cyan-600'
                    }`}>
                    {selectedRole.name === 'admin' ? <CrownOutlined className="text-white text-2xl" /> : <TeamOutlined className="text-white text-2xl" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Title level={3} className="text-xl m-0 mb-0">
                        {selectedRole.name.charAt(0).toUpperCase() + selectedRole.name.slice(1)}
                      </Title>
                      <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                        {selectedRole.permissions.length} permissions
                      </span>
                    </div>
                    <p className="text-gray-600 text-lg my-0">
                      {selectedRole.description || 'No description provided'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Role Information Card */}
              <Card title="Role Information" className="border-0 shadow-lg rounded-xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TeamOutlined className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Role Name</div>
                        <div className="font-medium text-gray-900">{selectedRole.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <KeyOutlined className="text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Total Permissions</div>
                        <div className="font-medium text-gray-900">{selectedRole.permissions.length}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <UserOutlined className="text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Created</div>
                        <div className="font-medium text-gray-900">{new Date(selectedRole.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <EditOutlined className="text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Last Updated</div>
                        <div className="font-medium text-gray-900">{new Date(selectedRole.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Permissions Card with Grouping */}
              <Card title="Permissions" className="border-0 shadow-lg rounded-xl">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-semibold text-gray-800">Permission Groups</div>
                    <div className="text-sm text-gray-500">
                      {selectedRole.permissions.length} total permissions
                    </div>
                  </div>
                </div>

                {/* Group permissions by group name (extract from permission name format: groupname.permissionname) */}
                {(() => {
                  const groupedPermissions = selectedRole.permissions.reduce((acc, permission) => {
                    const [group] = permission.name.split('.');
                    if (!acc[group]) {
                      acc[group] = [];
                    }
                    acc[group].push(permission);
                    return acc;
                  }, {} as Record<string, typeof selectedRole.permissions>);

                  return (
                    <div className="space-y-4">
                      {Object.entries(groupedPermissions).map(([group, perms]) => (
                        <div key={group} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <DatabaseOutlined className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 capitalize">{group}</div>
                              <div className="text-sm text-gray-500">{perms.length} permission{perms.length !== 1 ? 's' : ''}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {perms.map(permission => {
                              const [, action] = permission.name.split('.');
                              return (
                                <div key={permission.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <KeyOutlined className="text-white text-sm" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{permission.description || permission.name || action || 'No description provided'}</div>
                                    <div className="text-sm text-gray-500">
                                      Group: <span className="capitalize">{group}</span>
                                      {permission.action && (
                                        <>
                                          <span className="mx-2">•</span>
                                          Action: <Tag color="green" className="text-xs">{permission.action}</Tag>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {permission.name && (
                                    <Tooltip title={action || permission.name || 'No name provided'}>
                                      <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                        ℹ️
                                      </div>
                                    </Tooltip>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedRole(null);
                    openRoleModal(selectedRole);
                  }}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Edit Role
                </Button>
                <Button
                  onClick={() => setSelectedRole(null)}
                  className="rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-500 transition-all duration-200"
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
