import React from 'react';
import { Table, Typography } from 'antd';
import { useJournalEntries } from '../hooks';
import { JournalEntryLineType } from '../types';
import { formatCurrency, formatDate } from '../../common/utils';

const { Text } = Typography;

export const RecentJournalEntries: React.FC = () => {
  const { data: journalEntries, isLoading } = useJournalEntries();

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
      render: (_: unknown, record: { lines: Array<{ amount: number; type: string }> }) => {
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
  ];

  const recentEntries = journalEntries
    ?.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    })
    .slice(0, 10) || [];

  return (
    <Table
      columns={columns}
      dataSource={recentEntries}
      rowKey="id"
      loading={isLoading}
      pagination={false}
      size="small"
    />
  );
};

