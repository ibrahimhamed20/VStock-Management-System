import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  message,
} from 'antd';
import { AccountType, type Account } from '../types';
import { useAccountMutations, useAccountsTree } from '../hooks';

const { Option } = Select;

interface AccountModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  account?: Account | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  account
}) => {
  const [form] = Form.useForm();
  const { data: accountsTree } = useAccountsTree();
  const { createAccount, updateAccount } = useAccountMutations();

  const isEditing = !!account;

  useEffect(() => {
    if (visible) {
      if (account) {
        form.setFieldsValue({
          code: account.code,
          name: account.name,
          type: account.type,
          parentId: account.parentId,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, account, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (isEditing) {
        await updateAccount.mutateAsync({
          id: account!.id,
          data: values,
        });
        message.success('Account updated successfully');
      } else {
        await createAccount.mutateAsync(values);
        message.success('Account created successfully');
      }

      onSuccess();
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || 'Failed to save account');
    }
  };

  // Flatten accounts tree for parent selection
  const flattenAccounts = (accounts: Account[], result: Account[] = []): Account[] => {
    accounts.forEach(acc => {
      result.push(acc);
      if (acc.children && acc.children.length > 0) {
        flattenAccounts(acc.children, result);
      }
    });
    return result;
  };

  const allAccounts = accountsTree ? flattenAccounts(accountsTree) : [];
  const parentOptions = allAccounts.filter(acc => acc.id !== account?.id);

  return (
    <Modal
      title={isEditing ? 'Edit Account' : 'Create Account'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={600}
      okText={isEditing ? 'Update' : 'Create'}
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="code"
              label="Account Code"
              rules={[
                { required: true, message: 'Please enter account code' },
                { max: 20, message: 'Code must be less than 20 characters' }
              ]}
            >
              <Input placeholder="e.g., 1000" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Account Type"
              rules={[{ required: true, message: 'Please select account type' }]}
            >
              <Select placeholder="Select Type">
                <Option value={AccountType.ASSET}>Asset</Option>
                <Option value={AccountType.LIABILITY}>Liability</Option>
                <Option value={AccountType.EQUITY}>Equity</Option>
                <Option value={AccountType.REVENUE}>Revenue</Option>
                <Option value={AccountType.EXPENSE}>Expense</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="name"
          label="Account Name"
          rules={[
            { required: true, message: 'Please enter account name' },
            { max: 255, message: 'Name must be less than 255 characters' }
          ]}
        >
          <Input placeholder="Enter account name" />
        </Form.Item>

        <Form.Item
          name="parentId"
          label="Parent Account"
        >
          <Select 
            placeholder="Select parent account (optional)" 
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {parentOptions.map(acc => (
              <Option key={acc.id} value={acc.id}>
                {acc.code} - {acc.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

