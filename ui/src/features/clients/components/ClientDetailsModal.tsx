import React, { useState } from 'react';
import {
  Modal,
  Descriptions,
  Tag,
  Button,
  Space,
  Table,
  Typography,
  Input,
  message,
} from 'antd';
import {
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useClient, useClientTransactions, useAddTags, useRemoveTags } from '../hooks';
import type { Client } from '../types';
import { ClientModal } from './ClientModal';

const { Text } = Typography;

interface ClientDetailsModalProps {
  open: boolean;
  onClose: () => void;
  clientId: string | null;
  onEdit?: (client: Client) => void;
}

export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  open,
  onClose,
  clientId,
  onEdit,
}) => {
  const { data: client, isLoading } = useClient(clientId);
  const { data: transactions = [] } = useClientTransactions(clientId);
  const addTags = useAddTags();
  const removeTags = useRemoveTags();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTag, setNewTag] = useState('');

  if (!clientId) return null;

  const handleAddTag = async () => {
    if (!newTag.trim() || !client) return;

    try {
      await addTags.mutateAsync({
        id: client.id,
        data: { tags: [newTag.trim()] },
      });
      setNewTag('');
      message.success('Tag added successfully');
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!client) return;

    try {
      await removeTags.mutateAsync({
        id: client.id,
        data: { tags: [tag] },
      });
      message.success('Tag removed successfully');
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'purchase' ? 'green' : type === 'refund' ? 'orange' : 'blue'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
  ];

  return (
    <>
      <Modal
        title="Client Details"
        open={open}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
          ...(onEdit && client
            ? [
                <Button
                  key="edit"
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit
                </Button>,
              ]
            : []),
        ]}
        width={800}
      >
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : client ? (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Code">{client.code || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Name">{client.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{client.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{client.phone}</Descriptions.Item>
              <Descriptions.Item label="Tags" span={2}>
                <Space wrap>
                  {client.tags.map((tag) => (
                    <Tag
                      key={tag}
                      closable
                      onClose={() => handleRemoveTag(tag)}
                      color="blue"
                    >
                      {tag}
                    </Tag>
                  ))}
                  <Input
                    placeholder="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onPressEnter={handleAddTag}
                    style={{ width: 120 }}
                    suffix={
                      <Button
                        type="text"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={handleAddTag}
                        loading={addTags.isPending}
                      />
                    }
                  />
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Created At" span={2}>
                {new Date(client.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At" span={2}>
                {new Date(client.updatedAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <div className="mt-6">
              <Text strong className="text-lg">
                Transaction History
              </Text>
              <Table
                columns={transactionColumns}
                dataSource={transactions}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                className="mt-4"
              />
            </div>
          </>
        ) : (
          <div className="text-center py-8">Client not found</div>
        )}
      </Modal>

      {client && (
        <ClientModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          client={client}
        />
      )}
    </>
  );
};

