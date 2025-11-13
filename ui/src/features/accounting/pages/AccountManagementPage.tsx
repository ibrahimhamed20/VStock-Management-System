import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  Tag, 
  Typography, 
  Row, 
  Col,
  Tooltip,
  Popconfirm,
  message,
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
} from '@ant-design/icons';
import { useAccountsTree, useAccountMutations } from '../hooks';
import { AccountType, type Account } from '../types';
import { formatCurrency } from '../../common/utils';
import { AccountModal } from '../components/AccountModal';

const { Title, Text } = Typography;
const { Option } = Select;

export const AccountManagementPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<AccountType | undefined>(undefined);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const { data: accountsTree, isLoading, error, refetch } = useAccountsTree();
  const { deleteAccount } = useAccountMutations();

  const handleCreateAccount = () => {
    setEditingAccount(null);
    setIsModalVisible(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsModalVisible(true);
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteAccount.mutateAsync(accountId);
      message.success('Account deleted successfully');
      refetch();
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || 'Failed to delete account');
    }
  };

  // Flatten accounts tree for table display
  const flattenAccounts = (accounts: Account[], level = 0, result: Array<Account & { level: number }> = []): Array<Account & { level: number }> => {
    accounts.forEach(acc => {
      result.push({ ...acc, level });
      if (acc.children && acc.children.length > 0) {
        flattenAccounts(acc.children, level + 1, result);
      }
    });
    return result;
  };

  const allAccounts = accountsTree ? flattenAccounts(accountsTree) : [];

  const filteredAccounts = allAccounts.filter(account => {
    const matchesSearch = !searchText || 
      account.code.toLowerCase().includes(searchText.toLowerCase()) ||
      account.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = !selectedType || account.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getAccountTypeColor = (type: AccountType) => {
    const colors: Record<AccountType, string> = {
      [AccountType.ASSET]: 'blue',
      [AccountType.LIABILITY]: 'red',
      [AccountType.EQUITY]: 'green',
      [AccountType.REVENUE]: 'cyan',
      [AccountType.EXPENSE]: 'orange',
    };
    return colors[type] || 'default';
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string, record: Account & { level: number }) => (
        <div style={{ paddingLeft: `${record.level * 24}px` }}>
          <Text strong className="text-blue-600">{code}</Text>
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Account & { level: number }) => (
        <div style={{ paddingLeft: `${record.level * 24}px` }}>
          <Text>{name}</Text>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: AccountType) => (
        <Tag color={getAccountTypeColor(type)}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      width: 150,
      align: 'right' as const,
      render: (balance: number) => (
        <Text strong className={balance >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatCurrency(balance)}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: Account) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditAccount(record)}
            />
          </Tooltip>

          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this account?"
              description="This action cannot be undone. Make sure there are no journal entries associated with this account."
              onConfirm={() => handleDeleteAccount(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <Text type="danger">Failed to load accounts. Please try again.</Text>
        </div>
      </Card>
    );
  }

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
            Chart of Accounts
          </Title>
          <Text className="text-gray-600 text-lg">
            Manage your chart of accounts and account hierarchy
          </Text>
        </div>

        <div className="flex justify-between items-center">
          <div></div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateAccount}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Account
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={12}>
              <Input
                placeholder="Search accounts by code or name..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Filter by type"
                value={selectedType}
                onChange={setSelectedType}
                allowClear
                className="w-full"
                size="large"
              >
                <Option value={AccountType.ASSET}>Asset</Option>
                <Option value={AccountType.LIABILITY}>Liability</Option>
                <Option value={AccountType.EQUITY}>Equity</Option>
                <Option value={AccountType.REVENUE}>Revenue</Option>
                <Option value={AccountType.EXPENSE}>Expense</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Accounts Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredAccounts}
            loading={isLoading}
            rowKey="id"
            pagination={{
              total: filteredAccounts.length,
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} accounts`,
            }}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Modal */}
        <AccountModal
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onSuccess={() => {
            setIsModalVisible(false);
            refetch();
          }}
          account={editingAccount}
        />
      </div>
    </div>
  );
};

