import React from 'react';
import { Table } from 'antd';
import { UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { usePermissionMatrix } from '../hooks/usePermissionMatrix';

export const PermissionMatrixTable: React.FC = () => {
  const { data: permissionMatrix, isLoading } = usePermissionMatrix();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-gray-600 text-lg">Loading permission matrix...</div>
      </div>
    );
  }

  if (!permissionMatrix) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <UserOutlined className="text-gray-400 text-3xl" />
        </div>
        <div className="text-gray-600 text-lg mb-4 block">No permission matrix available</div>
        <div className="text-gray-500 mb-6 block">Permission matrix data could not be loaded</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table
        dataSource={permissionMatrix.roles}
        rowKey="id"
        pagination={false}
        size="small"
        className="permission-matrix-table"
        scroll={{ x: 'max-content' }}
      >
        <Table.Column
          title={
            <div className="text-center">
              <div className="font-semibold text-gray-800">Role</div>
              <div className="text-xs text-gray-500">Name & Description</div>
            </div>
          }
          key="name"
          fixed="left"
          width={200}
          render={(role) => (
            <div className="font-medium text-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserOutlined className="text-blue-600 text-xs" />
                </div>
                <span className="capitalize">{role.name}</span>
              </div>
              {role.description && (
                <div className="text-xs text-gray-500 mt-1 truncate" title={role.description}>
                  {role.description}
                </div>
              )}
            </div>
          )}
        />
        {permissionMatrix.permissions.map((permission) => (
          <Table.Column
            key={permission.id}
            title={
              <div className="text-center">
                <div className="text-xs font-medium text-gray-700 truncate" title={permission.name}>
                  {permission.name.split('.')[1] || permission.name}
                </div>
                <div className="text-xs text-gray-500 truncate" title={permission.description}>
                  {permission.description}
                </div>
              </div>
            }
            dataIndex="permissions"
            width={100}
            render={(permissions: string[]) => (
              <div className="text-center">
                {permissions.includes(permission.name) ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full mx-auto flex items-center justify-center shadow-sm">
                    <CheckCircleOutlined className="text-white text-xs" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded-full mx-auto"></div>
                )}
              </div>
            )}
          />
        ))}
      </Table>
    </div>
  );
};
