import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useCreateClient, useUpdateClient } from '../hooks';
import type { Client, CreateClientData, UpdateClientData } from '../types';

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({ open, onClose, client }) => {
  const [form] = Form.useForm();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  useEffect(() => {
    if (open) {
      if (client) {
        form.setFieldsValue({
          name: client.name,
          email: client.email,
          phone: client.phone,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, client, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (client) {
        await updateClient.mutateAsync({
          id: client.id,
          data: values as UpdateClientData,
        });
      } else {
        await createClient.mutateAsync(values as CreateClientData);
      }
      
      onClose();
      form.resetFields();
    } catch (error) {
      if ((error as { errorFields?: unknown[] })?.errorFields) {
        return; // Form validation errors
      }
      console.error('Failed to save client:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={client ? 'Edit Client' : 'Create New Client'}
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={createClient.isPending || updateClient.isPending}
        >
          {client ? 'Update' : 'Create'}
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: 'Please enter client name' },
            { min: 2, message: 'Name must be at least 2 characters' },
            { max: 255, message: 'Name must not exceed 255 characters' },
          ]}
        >
          <Input placeholder="Enter client name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter email address' },
            { type: 'email', message: 'Please enter a valid email address' },
          ]}
        >
          <Input placeholder="Enter email address" type="email" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone"
          rules={[
            { required: true, message: 'Please enter phone number' },
            { min: 10, message: 'Phone must be at least 10 characters' },
            { max: 20, message: 'Phone must not exceed 20 characters' },
          ]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

