import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Tag, 
  Typography, 
  Tooltip,
  Popconfirm,
  message,
  Badge,
  Switch
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { useSuppliers, useSupplierMutations } from '../hooks';
import type { Supplier } from '../types';
import { formatDate } from '../../common/utils';
import { SupplierModal } from '../components/SupplierModal';
import { SupplierDetailsModal } from '../components/SupplierDetailsModal';

const { Title, Text } = Typography;

export const SupplierManagementPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { data: suppliers, isLoading, error, refetch } = useSuppliers();
  const { deleteSupplier, updateSupplier } = useSupplierMutations();

  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    setIsModalVisible(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalVisible(true);
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailsModalVisible(true);
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    try {
      await deleteSupplier.mutateAsync(supplierId);
      message.success('Supplier deleted successfully');
      refetch();
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || 'Failed to delete supplier');
    }
  };

  const handleToggleStatus = async (supplier: Supplier) => {
    try {
      await updateSupplier.mutateAsync({
        id: supplier.id,
        data: { isActive: !supplier.isActive },
      });
      message.success(`Supplier ${!supplier.isActive ? 'activated' : 'deactivated'} successfully`);
      refetch();
    } catch {
      message.error('Failed to update supplier status');
    }
  };

  const filteredSuppliers = suppliers?.filter(supplier => {
    const searchLower = searchText.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(searchLower) ||
      supplier.email.toLowerCase().includes(searchLower) ||
      supplier.phone.toLowerCase().includes(searchLower) ||
      supplier.contactPerson.toLowerCase().includes(searchLower)
    );
  }) || [];

  const columns = [
    {
      title: 'Supplier',
      key: 'supplier',
      width: 250,
      render: (_: unknown, record: Supplier) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <UserOutlined className="text-white text-lg" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MailOutlined className="mr-1" />
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 150,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (text: string) => (
        <div className="flex items-center">
          <PhoneOutlined className="mr-2 text-gray-400" />
          <Text>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Payment Terms',
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
      width: 120,
      align: 'center' as const,
      render: (terms: number) => (
        <Text>{terms} days</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center' as const,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'} icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: Date) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: Supplier) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewSupplier(record)}
            />
          </Tooltip>
          
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditSupplier(record)}
            />
          </Tooltip>

          <Tooltip title={record.isActive ? 'Deactivate' : 'Activate'}>
            <Switch
              checked={record.isActive}
              onChange={() => handleToggleStatus(record)}
              size="small"
            />
          </Tooltip>

          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this supplier?"
              description="This action cannot be undone. Purchases associated with this supplier will remain."
              onConfirm={() => handleDeleteSupplier(record.id)}
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
          <Text type="danger">Failed to load suppliers. Please try again.</Text>
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
            Supplier Management
          </Title>
          <Text className="text-gray-600 text-lg">
            Manage supplier information, track relationships, and monitor supplier performance
          </Text>
        </div>

        <div className="flex justify-between items-center">
          <div></div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateSupplier}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Supplier
          </Button>
        </div>

        {/* Search */}
        <Card>
          <Input
            placeholder="Search suppliers by name, email, phone, or contact person..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="large"
          />
        </Card>

        {/* Suppliers Table */}
        <Card>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Badge count={filteredSuppliers.length} showZero>
                <UserOutlined className="text-2xl text-gray-400" />
              </Badge>
              <Text className="text-gray-600">
                {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} found
              </Text>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={filteredSuppliers}
            loading={isLoading}
            rowKey="id"
            pagination={{
              total: filteredSuppliers.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} suppliers`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* Modals */}
        <SupplierModal
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onSuccess={() => {
            setIsModalVisible(false);
            refetch();
          }}
          supplier={editingSupplier}
        />

        <SupplierDetailsModal
          visible={isDetailsModalVisible}
          onCancel={() => setIsDetailsModalVisible(false)}
          onEdit={() => {
            setIsDetailsModalVisible(false);
            if (selectedSupplier) {
              handleEditSupplier(selectedSupplier);
            }
          }}
          supplier={selectedSupplier}
        />
      </div>
    </div>
  );
};

