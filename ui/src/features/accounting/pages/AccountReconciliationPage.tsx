import React, { useState } from 'react';
import {
  Card,
  Select,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  Button,
  message,
  DatePicker,
  InputNumber,
  Form,
  Modal,
  Alert,
} from 'antd';
import {
  CheckCircleOutlined,
  AccountBookOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import { useAccounts } from '../hooks';
import { useReconcileAccount } from '../hooks';
import { formatCurrency } from '../../common/utils';

const { Title, Text } = Typography;
const { Option } = Select;

export const AccountReconciliationPage: React.FC = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);
  const [isReconcileModalVisible, setIsReconcileModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { data: accounts } = useAccounts();
  const reconcileAccount = useReconcileAccount();

  const handleReconcile = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedAccountId) {
        message.error('Please select an account');
        return;
      }

      await reconcileAccount.mutateAsync({
        accountId: selectedAccountId,
        data: {
          statementBalance: values.statementBalance,
          statementDate: values.statementDate.format('YYYY-MM-DD'),
        },
      });

      message.success('Account reconciled successfully');
      setIsReconcileModalVisible(false);
      form.resetFields();
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || 'Failed to reconcile account');
    }
  };

  const selectedAccount = accounts?.find(acc => acc.id === selectedAccountId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={1} className="text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Account Reconciliation
          </Title>
          <Text className="text-gray-600 text-lg">
            Verify and reconcile account balances with bank statements
          </Text>
        </div>

        {/* Account Selection */}
        <Card>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} md={16}>
              <Space>
                <AccountBookOutlined />
                <Text strong>Select Account:</Text>
              </Space>
              <Select
                placeholder="Select account to reconcile"
                value={selectedAccountId}
                onChange={setSelectedAccountId}
                className="w-full mt-2"
                size="large"
                showSearch
                optionFilterProp="children"
              >
                {accounts?.map(account => (
                  <Option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => setIsReconcileModalVisible(true)}
                disabled={!selectedAccountId}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                size="large"
              >
                Reconcile Account
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Account Information */}
        {selectedAccount && (
          <Card
            title={
              <Space>
                <CalculatorOutlined className="text-blue-600" />
                <span>Account Information - {selectedAccount.code}</span>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div>
                  <Text type="secondary">Account Name:</Text>
                  <br />
                  <Text strong>{selectedAccount.name}</Text>
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <Text type="secondary">Account Type:</Text>
                  <br />
                  <Tag color="blue">{selectedAccount.type.toUpperCase()}</Tag>
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <Text type="secondary">Current Balance:</Text>
                  <br />
                  <Text strong className="text-blue-600 text-lg">
                    {formatCurrency(selectedAccount.balance)}
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* Reconciliation Modal */}
        <Modal
          title={
            <Space>
              <CheckCircleOutlined className="text-green-600" />
              <span>Reconcile Account</span>
            </Space>
          }
          open={isReconcileModalVisible}
          onCancel={() => {
            setIsReconcileModalVisible(false);
            form.resetFields();
          }}
          onOk={handleReconcile}
          okText="Reconcile"
          cancelText="Cancel"
          width={600}
        >
          <Form form={form} layout="vertical">
            {selectedAccount && (
              <Alert
                message={`Reconciling: ${selectedAccount.code} - ${selectedAccount.name}`}
                description={`Current book balance: ${formatCurrency(selectedAccount.balance)}`}
                type="info"
                showIcon
                className="mb-4"
              />
            )}

            <Form.Item
              name="statementDate"
              label="Statement Date"
              rules={[{ required: true, message: 'Please select statement date' }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="statementBalance"
              label="Statement Balance"
              rules={[{ required: true, message: 'Please enter statement balance' }]}
            >
              <InputNumber
                className="w-full"
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: string | undefined) => parseFloat((value || '').replace(/\$\s?|(,*)/g, '')) || 0}
                min={0}
                step={0.01}
                placeholder="Enter balance from bank statement"
              />
            </Form.Item>

            {selectedAccount && form.getFieldValue('statementBalance') !== undefined && (
              <Alert
                message={
                  form.getFieldValue('statementBalance') === selectedAccount.balance
                    ? 'Balances Match ✓'
                    : `Difference: ${formatCurrency(Math.abs((form.getFieldValue('statementBalance') || 0) - selectedAccount.balance))}`
                }
                type={form.getFieldValue('statementBalance') === selectedAccount.balance ? 'success' : 'warning'}
                showIcon
                className="mt-4"
              />
            )}
          </Form>
        </Modal>
      </div>
    </div>
  );
};

