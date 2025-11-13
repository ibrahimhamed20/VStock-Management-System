import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Select,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { useClients, useDeleteClient } from '../hooks';
import { ClientModal, ClientDetailsModal } from '../components';
import type { Client, ClientFilters } from '../types';

const { Option } = Select;

export const ClientsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filters: ClientFilters = useMemo(() => {
    const f: ClientFilters = {};
    if (searchText) f.search = searchText;
    if (selectedTag) f.tag = selectedTag;
    return f;
  }, [searchText, selectedTag]);

  const { data: clients = [], isLoading } = useClients(filters);
  const deleteClient = useDeleteClient();

  // Extract all unique tags for filter
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    clients.forEach((client) => {
      client.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [clients]);

  const handleCreate = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClient.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => code || 'N/A',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space wrap>
          {tags.length > 0 ? (
            tags.map((tag) => (
              <Tag key={tag} color="blue">
                {tag}
              </Tag>
            ))
          ) : (
            <Tag color="default">No tags</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Transactions',
      dataIndex: 'transactions',
      key: 'transactions',
      render: (transactions: any[]) => (
        <Tag color={transactions.length > 0 ? 'green' : 'default'}>
          {transactions.length}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Client) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this client?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <Card className="shadow-lg border-0 rounded-xl">
        <div className="mb-6">
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Clients Management</h1>
              <p className="text-gray-600">Manage your customer relationships and data</p>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Client
              </Button>
            </Col>
          </Row>
        </div>

        <Row gutter={16} className="mb-4">
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder="Search by name, email, phone, or code"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by tag"
              value={selectedTag}
              onChange={setSelectedTag}
              allowClear
              size="large"
              className="w-full"
            >
              {allTags.map((tag) => (
                <Option key={tag} value={tag}>
                  <TagOutlined /> {tag}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={clients}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `${total} clients`,
          }}
        />
      </Card>

      <ClientModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        client={editingClient}
      />

      <ClientDetailsModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedClient(null);
        }}
        clientId={selectedClient?.id || null}
        onEdit={handleEdit}
      />
    </div>
  );
};

