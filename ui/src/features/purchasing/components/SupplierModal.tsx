import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  message,
  Switch,
} from 'antd';
import type { Supplier } from '../types';
import { useSupplierMutations } from '../hooks';

const { TextArea } = Input;

interface SupplierModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  supplier?: Supplier | null;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  supplier
}) => {
  const [form] = Form.useForm();
  const { createSupplier, updateSupplier } = useSupplierMutations();

  const isEditing = !!supplier;

  useEffect(() => {
    if (visible) {
      if (supplier) {
        form.setFieldsValue({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          contactPerson: supplier.contactPerson,
          taxId: supplier.taxId,
          paymentTerms: supplier.paymentTerms,
          isActive: supplier.isActive,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ paymentTerms: 30, isActive: true });
      }
    }
  }, [visible, supplier, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (isEditing) {
        await updateSupplier.mutateAsync({
          id: supplier!.id,
          data: values,
        });
        message.success('Supplier updated successfully');
      } else {
        await createSupplier.mutateAsync(values);
        message.success('Supplier created successfully');
      }

      onSuccess();
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || 'Failed to save supplier');
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Supplier' : 'Create Supplier'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={700}
      okText={isEditing ? 'Update' : 'Create'}
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Supplier Name"
              rules={[
                { required: true, message: 'Please enter supplier name' },
                { max: 255, message: 'Name must be less than 255 characters' }
              ]}
            >
              <Input placeholder="Enter supplier name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input placeholder="supplier@example.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                { required: true, message: 'Please enter phone number' },
                { max: 20, message: 'Phone must be less than 20 characters' }
              ]}
            >
              <Input placeholder="+1-555-0123" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contactPerson"
              label="Contact Person"
              rules={[
                { required: true, message: 'Please enter contact person' },
                { max: 255, message: 'Contact person must be less than 255 characters' }
              ]}
            >
              <Input placeholder="John Smith" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: 'Please enter address' }]}
        >
          <TextArea rows={3} placeholder="Enter full address" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="taxId"
              label="Tax ID"
              rules={[{ max: 50, message: 'Tax ID must be less than 50 characters' }]}
            >
              <Input placeholder="TAX-123456789" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="paymentTerms"
              label="Payment Terms (days)"
              rules={[
                { type: 'number', min: 0, message: 'Payment terms must be positive' }
              ]}
            >
              <InputNumber
                min={0}
                className="w-full"
                placeholder="30"
              />
            </Form.Item>
          </Col>
        </Row>

        {isEditing && (
          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

