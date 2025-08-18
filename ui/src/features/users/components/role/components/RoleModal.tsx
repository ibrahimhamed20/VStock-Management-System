import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Typography } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { PermissionSelector } from './PermissionSelector';
import type { Role } from '@auth/types';

const { Title } = Typography;
const { TextArea } = Input;

interface RoleModalProps {
  visible: boolean;
  editingRole: Role | null;
  onCancel: () => void;
  onSave: (values: any) => void;
  selectedPermissions: string[];
  onPermissionsChange: (permissions: string[]) => void;
  allPermissions: string[];
  isLoading: boolean;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  visible,
  editingRole,
  onCancel,
  onSave,
  selectedPermissions,
  onPermissionsChange,
  allPermissions,
  isLoading,
}) => {
  const [roleForm] = Form.useForm();

  useEffect(() => {
    if (visible && editingRole) {
      roleForm.setFieldsValue({
        name: editingRole.name,
        description: editingRole.description,
        permissions: selectedPermissions,
      });
    } else if (visible) {
      roleForm.resetFields();
    }
  }, [visible, editingRole, selectedPermissions, roleForm]);

  const handleSave = () => {
    roleForm.validateFields().then((values) => {
      onSave({ ...values, permissions: selectedPermissions });
    });
  };

  const handleCancel = () => {
    roleForm.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="text-center">
          <Title level={3} className="mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {editingRole ? 'Edit Role' : 'Create New Role'}
          </Title>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="rounded-2xl"
    >
      <Form
        form={roleForm}
        layout="vertical"
        onFinish={handleSave}
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

        <PermissionSelector
          selectedPermissions={selectedPermissions}
          onPermissionsChange={onPermissionsChange}
          allPermissions={allPermissions}
        />

        <Form.Item className="mb-0 pt-4">
          <div className="flex space-x-4">
            <Button
              type="primary"
              onClick={handleSave}
              size="large"
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base"
              loading={isLoading}
            >
              {editingRole ? 'Update Role' : 'Create Role'}
            </Button>
            <Button
              size="large"
              onClick={handleCancel}
              className="h-12 rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-500 transition-all duration-200"
              loading={isLoading}
            >
              Cancel
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
