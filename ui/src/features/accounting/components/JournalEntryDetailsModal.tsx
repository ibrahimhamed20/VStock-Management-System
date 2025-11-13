import React from 'react';
import {
  Modal,
  Table,
  Tag,
  Typography,
  Space,
  Card,
  Row,
  Col,
} from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { JournalEntry } from '../types';
import { JournalEntryLineType } from '../types';
import { formatCurrency, formatDate } from '../../common/utils';

const { Text } = Typography;

interface JournalEntryDetailsModalProps {
  visible: boolean;
  onCancel: () => void;
  journalEntry: JournalEntry | null;
}

export const JournalEntryDetailsModal: React.FC<JournalEntryDetailsModalProps> = ({
  visible,
  onCancel,
  journalEntry
}) => {
  if (!journalEntry) return null;

  const debitTotal = journalEntry.lines
    .filter(line => line.type === JournalEntryLineType.DEBIT)
    .reduce((sum, line) => sum + Number(line.amount), 0);

  const creditTotal = journalEntry.lines
    .filter(line => line.type === JournalEntryLineType.CREDIT)
    .reduce((sum, line) => sum + Number(line.amount), 0);

  const lineColumns = [
    {
      title: 'Account',
      key: 'account',
      render: (_: unknown, record: { account?: { code: string; name: string } }) => (
        <div>
          <Text strong>{record.account?.code || 'N/A'}</Text>
          <br />
          <Text type="secondary" className="text-sm">
            {record.account?.name || 'Unknown Account'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: JournalEntryLineType) => (
        <Tag color={type === JournalEntryLineType.DEBIT ? 'green' : 'blue'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number, record: { type: JournalEntryLineType }) => (
        <Text strong className={record.type === JournalEntryLineType.DEBIT ? 'text-green-600' : 'text-blue-600'}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => desc || '-',
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined className="text-blue-600" />
          <span>Journal Entry Details - {journalEntry.code || 'N/A'}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={null}
    >
      <div className="space-y-6">
        {/* Entry Information */}
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div>
                <Text type="secondary">Date:</Text>
                <br />
                <Text strong>{formatDate(journalEntry.date)}</Text>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <Text type="secondary">Reference:</Text>
                <br />
                <Text strong>{journalEntry.reference || '-'}</Text>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <Text type="secondary">Code:</Text>
                <br />
                <Text strong className="text-blue-600">
                  {journalEntry.code || 'N/A'}
                </Text>
              </div>
            </Col>
            {journalEntry.description && (
              <Col span={24}>
                <div>
                  <Text type="secondary">Description:</Text>
                  <br />
                  <Text>{journalEntry.description}</Text>
                </div>
              </Col>
            )}
          </Row>
        </Card>

        {/* Journal Entry Lines */}
        <Card 
          title={
            <Space>
              <DollarOutlined className="text-green-600" />
              <span>Journal Entry Lines</span>
            </Space>
          }
        >
          <Table
            columns={lineColumns}
            dataSource={journalEntry.lines}
            rowKey="id"
            pagination={false}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Text strong>Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Space>
                      <Text strong className="text-green-600">
                        Debits: {formatCurrency(debitTotal)}
                      </Text>
                      <Text strong className="text-blue-600">
                        Credits: {formatCurrency(creditTotal)}
                      </Text>
                    </Space>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={1}>
                    <Tag color={debitTotal === creditTotal ? 'green' : 'red'}>
                      {debitTotal === creditTotal ? 'Balanced' : 'Unbalanced'}
                    </Tag>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        {/* Dates */}
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div>
                <Text type="secondary">Created:</Text>
                <br />
                <Text strong>{formatDate(journalEntry.createdAt)}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Last Updated:</Text>
                <br />
                <Text strong>{formatDate(journalEntry.updatedAt)}</Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

