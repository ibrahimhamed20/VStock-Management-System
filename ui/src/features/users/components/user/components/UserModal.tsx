import React from 'react';
import { Modal, Form, Input, Select, Button, Row, Col, Typography } from 'antd';
import { UserOutlined, CrownOutlined, TeamOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useUserOperations } from '../hooks/useUserMutations';
import { useRoles } from '../../role/hooks/useRoles';
import type { User, CreateUserData, UpdateUserData } from '../types/user.types';

const { Title } = Typography;
const { Option } = Select;

interface UserModalProps {
  visible: boolean;
  onCancel: () => void;
  editingUser: User | null;
  form: any;
}

export const UserModal: React.FC<UserModalProps> = ({
  visible,
  onCancel,
  editingUser,
  form,
}) => {
  const { createUser, updateUser, isCreating, isUpdating } = useUserOperations();
  const { data: roles } = useRoles();

  const handleSave = async (values: any) => {
    try {
      if (editingUser) {
        const updateData: UpdateUserData = {
          email: values.email,
          roles: values.roles,
          status: values.status,
        };
        await updateUser({ id: editingUser.id, userData: updateData });
      } else {
        const createData: CreateUserData = {
          username: values.username,
          email: values.email,
          roles: values.roles,
        };
        await createUser(createData);
      }
      onCancel();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  return (
    <Modal
      title={
        <div className="text-center">
          <Title level={3} className="mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {editingUser ? 'Edit User' : 'Create New User'}
          </Title>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      className="rounded-2xl"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="space-y-6"
      >
        {!editingUser && (
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
        )}

        <Row gutter={16}>
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
          <Col span={12}>
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
                <Option value="pending">
                  <div className="flex items-center space-x-2">
                    <UserOutlined className="text-yellow-500" />
                    <span>Pending</span>
                  </div>
                </Option>
                <Option value="blocked">
                  <div className="flex items-center space-x-2">
                    <UserOutlined className="text-red-500" />
                    <span>Blocked</span>
                  </div>
                </Option>
                <Option value="rejected">
                  <div className="flex items-center space-x-2">
                    <UserOutlined className="text-orange-500" />
                    <span>Rejected</span>
                  </div>
                </Option>
              </Select>
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
            {roles?.map(role => (
              <Option key={role.id} value={role.name}>
                <div className="flex items-center space-x-2">
                  {role.name === 'admin' ? <CrownOutlined className="text-red-500" /> : <TeamOutlined className="text-blue-500" />}
                  <span>{role.name}</span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item className="mb-0 pt-4">
          <div className="flex space-x-4">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isCreating || isUpdating}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base"
            >
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
            <Button
              size="large"
              onClick={onCancel}
              className="h-12 rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-500 transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
