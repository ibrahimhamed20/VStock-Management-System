import React, { useState } from 'react';
import dayjs from 'dayjs';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  DatePicker, 
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
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
} from '@ant-design/icons';
import { useJournalEntries, useAccounts, useJournalEntryMutations } from '../hooks';
import type { JournalEntry, JournalEntryFilters } from '../types';
import { JournalEntryLineType } from '../types';
import { formatCurrency, formatDate } from '../../common/utils';
import { JournalEntryModal } from '../components/JournalEntryModal';
import { JournalEntryDetailsModal } from '../components/JournalEntryDetailsModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export const JournalEntryManagementPage: React.FC = () => {
  const [filters, setFilters] = useState<JournalEntryFilters>({});
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const { data: journalEntries, isLoading, error, refetch } = useJournalEntries(filters);
  const { data: accounts } = useAccounts();
  const { deleteJournalEntry } = useJournalEntryMutations();

  const handleCreateEntry = () => {
    setEditingEntry(null);
    setIsModalVisible(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsModalVisible(true);
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsDetailsModalVisible(true);
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteJournalEntry.mutateAsync(entryId);
      message.success('Journal entry deleted successfully');
      refetch();
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || 'Failed to delete journal entry');
    }
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => (
        <Text strong className="text-blue-600">
          {code || 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: Date | string) => formatDate(date),
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
      width: 150,
      render: (ref: string) => ref || '-',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Total Amount',
      key: 'total',
      width: 150,
      align: 'right' as const,
      render: (_: unknown, record: JournalEntry) => {
        const debitTotal = record.lines
          .filter(line => line.type === JournalEntryLineType.DEBIT)
          .reduce((sum, line) => sum + Number(line.amount), 0);
        return (
          <Text strong className="text-green-600">
            {formatCurrency(debitTotal)}
          </Text>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: JournalEntry) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewEntry(record)}
            />
          </Tooltip>
          
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditEntry(record)}
            />
          </Tooltip>

          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this journal entry?"
              description="This action cannot be undone and will affect account balances."
              onConfirm={() => handleDeleteEntry(record.id)}
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
          <Text type="danger">Failed to load journal entries. Please try again.</Text>
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
            Journal Entry Management
          </Title>
          <Text className="text-gray-600 text-lg">
            Record and manage accounting transactions
          </Text>
        </div>

        <div className="flex justify-between items-center">
          <div></div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateEntry}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create Journal Entry
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search by code, reference, or description..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Filter by account"
                value={filters.accountId}
                onChange={(value) => setFilters({ ...filters, accountId: value })}
                allowClear
                className="w-full"
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
            <Col xs={24} sm={12} md={10}>
              <RangePicker
                placeholder={['Start Date', 'End Date']}
                value={filters.startDate && filters.endDate 
                  ? [dayjs(filters.startDate), dayjs(filters.endDate)] as [dayjs.Dayjs, dayjs.Dayjs]
                  : null}
                onChange={(dates) => setFilters({
                  ...filters,
                  startDate: dates?.[0]?.format('YYYY-MM-DD'),
                  endDate: dates?.[1]?.format('YYYY-MM-DD'),
                })}
                className="w-full"
                size="large"
              />
            </Col>
          </Row>
        </Card>

        {/* Journal Entries Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={journalEntries}
            loading={isLoading}
            rowKey="id"
            pagination={{
              total: journalEntries?.length || 0,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} entries`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* Modals */}
        <JournalEntryModal
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onSuccess={() => {
            setIsModalVisible(false);
            refetch();
          }}
          journalEntry={editingEntry}
        />

        <JournalEntryDetailsModal
          visible={isDetailsModalVisible}
          onCancel={() => setIsDetailsModalVisible(false)}
          journalEntry={selectedEntry}
        />
      </div>
    </div>
  );
};

