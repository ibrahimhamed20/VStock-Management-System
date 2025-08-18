import React, { useState } from 'react';
import { Table, Button, Card, Typography, Space, Tag, Popconfirm, Row, Col, Tooltip, Input, message } from 'antd';
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
import { RoleStats } from './components/RoleStats';
import { RoleModal } from './components/RoleModal';
import { RoleDetailsModal } from './components/RoleDetailsModal';
import { useRoles } from './hooks/useRoles';
import { usePermissions } from './hooks/usePermissions';
import { useRoleOperations } from './hooks/useRoleMutations';
import type { CreateRoleData, Role } from '@auth/types';

const { Title, Text } = Typography;

export const RoleManagement: React.FC = () => {
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // React Query hooks
  const { data: roles = [], isLoading, refetch } = useRoles();
  const { data: permissions = [] } = usePermissions();
  const { createRole, isCreating, updateRole, isUpdating, deleteRole, isDeleting } = useRoleOperations();

  const openRoleModal = (role?: Role) => {
    setEditingRole(role || null);
    if (role) {
      const selectedPermissions = role.permissions.map(p => p.name);
      setSelectedPermissions(selectedPermissions);
    } else {
      setSelectedPermissions([]);
    }
    setRoleModalVisible(true);
  };

  const handleSaveRole = async (values: CreateRoleData) => {
    try {
      if (editingRole) {
        await updateRole({
          id: editingRole.id,
          roleData: { ...values, permissions: selectedPermissions }
        });
      } else {
        await createRole({
          ...values,
          permissions: selectedPermissions
        });
      }
      setRoleModalVisible(false);
      setSelectedPermissions([]);
    } catch (error) {
      // Error handling is done in the mutation hook
      message.error('Failed to save role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteRole(roleId);
    } catch (error) {
      // Error handling is done in the mutation hook
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
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 action-btn"
            />
          </Tooltip>

          <Tooltip title="Edit Role">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openRoleModal(role)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 action-btn"
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
                loading={isDeleting}
                icon={<DeleteOutlined />}
                className="hover:bg-red-50 action-btn"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

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
        <RoleStats />

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
                onClick={() => refetch()}
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
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} roles`,
              className: "rounded-xl"
            }}
            className="rounded-xl"
            onRow={(role) => ({
              onClick: (e) => {
                // Only open view details if clicking on the row itself, not on action buttons
                if (!(e.target as HTMLElement).closest('.action-btn')) {
                  setSelectedRole(role);
                }
              },
              className: 'cursor-pointer hover:bg-gray-50 transition-colors'
            })}
          />
        </Card>

        {/* Role Modal */}
        <RoleModal
          visible={roleModalVisible}
          editingRole={editingRole}
          onCancel={() => {
            setRoleModalVisible(false);
            setEditingRole(null);
            setSelectedPermissions([]);
          }}
          onSave={handleSaveRole}
          isLoading={isCreating || isUpdating}
          selectedPermissions={selectedPermissions}
          onPermissionsChange={setSelectedPermissions}
          allPermissions={permissions.map(p => p.name)}
        />

        {/* Role Details Modal */}
        <RoleDetailsModal
          selectedRole={selectedRole}
          onClose={() => setSelectedRole(null)}
          onEdit={(role) => {
            setSelectedRole(null);
            openRoleModal(role);
          }}
        />
      </div>
    </div>
  );
};
