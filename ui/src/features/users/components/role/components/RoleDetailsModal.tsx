import React from 'react';
import { Modal, Card, Typography, Button, Tag, Tooltip } from 'antd';
import {
  CrownOutlined,
  TeamOutlined,
  UserOutlined,
  KeyOutlined,
  DatabaseOutlined,
  EditOutlined
} from '@ant-design/icons';
import type { Role } from '@auth/types';

const { Title } = Typography;

interface RoleDetailsModalProps {
  selectedRole: Role | null;
  onClose: () => void;
  onEdit: (role: Role) => void;
}

export const RoleDetailsModal: React.FC<RoleDetailsModalProps> = ({
  selectedRole,
  onClose,
  onEdit,
}) => {
  if (!selectedRole) return null;

  return (
    <Modal
      title={
        <div className="text-center">
          <Title level={3} className="mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Role Details
          </Title>
        </div>
      }
      open={!!selectedRole}
      onCancel={onClose}
      footer={null}
      width={800}
      className="rounded-2xl"
    >
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
              onClose();
              onEdit(selectedRole);
            }}
            className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Edit Role
          </Button>
          <Button
            onClick={onClose}
            className="rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-500 transition-all duration-200"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
