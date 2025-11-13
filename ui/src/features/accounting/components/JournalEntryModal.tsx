import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  Table,
  InputNumber,
  message,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { JournalEntry, JournalEntryLineForm } from '../types';
import { JournalEntryLineType } from '../types';
import { useAccounts, useJournalEntryMutations } from '../hooks';
import { formatCurrency } from '../../common/utils';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface JournalEntryModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  journalEntry?: JournalEntry | null;
}

export const JournalEntryModal: React.FC<JournalEntryModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  journalEntry
}) => {
  const [form] = Form.useForm();
  const [lines, setLines] = useState<JournalEntryLineForm[]>([]);
  const { data: accounts } = useAccounts();
  const { createJournalEntry, updateJournalEntry } = useJournalEntryMutations();

  const isEditing = !!journalEntry;

  // Calculate totals using useMemo
  const { debitTotal, creditTotal, isBalanced } = useMemo(() => {
    const debit = lines
      .filter(line => line.type === JournalEntryLineType.DEBIT)
      .reduce((sum, line) => sum + Number(line.amount || 0), 0);
    const credit = lines
      .filter(line => line.type === JournalEntryLineType.CREDIT)
      .reduce((sum, line) => sum + Number(line.amount || 0), 0);
    return {
      debitTotal: debit,
      creditTotal: credit,
      isBalanced: debit === credit && debit > 0,
    };
  }, [lines]);

  useEffect(() => {
    if (visible) {
      if (journalEntry) {
        form.setFieldsValue({
          date: dayjs(journalEntry.date),
          reference: journalEntry.reference,
          description: journalEntry.description,
        });
        setLines(journalEntry.lines.map((line, index) => ({
          id: line.id || `line-${index}`,
          accountId: line.accountId,
          accountName: line.account?.name || '',
          accountCode: line.account?.code || '',
          type: line.type,
          amount: Number(line.amount),
          description: line.description,
        })));
      } else {
        form.resetFields();
        form.setFieldsValue({ date: dayjs() });
        setLines([]);
      }
    }
  }, [visible, journalEntry, form]);

  const handleAddLine = () => {
    const newLine: JournalEntryLineForm = {
      id: `temp-${Date.now()}`,
      accountId: '',
      type: JournalEntryLineType.DEBIT,
      amount: 0,
    };
    setLines([...lines, newLine]);
  };

  const handleRemoveLine = (lineId: string) => {
    setLines(lines.filter(line => line.id !== lineId));
  };

  const handleLineChange = (lineId: string, field: keyof JournalEntryLineForm, value: string | number) => {
    const newLines = lines.map(line => {
      if (line.id === lineId) {
        return { ...line, [field]: value };
      }
      return line;
    });
    setLines(newLines);
  };

  const handleAccountSelect = (lineId: string, accountId: string) => {
    const account = accounts?.find(acc => acc.id === accountId);
    if (account) {
      handleLineChange(lineId, 'accountId', accountId);
      handleLineChange(lineId, 'accountName', account.name);
      handleLineChange(lineId, 'accountCode', account.code);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (lines.length < 2) {
        message.error('Please add at least two lines (one debit and one credit)');
        return;
      }

      if (!isBalanced) {
        message.error('Debits and credits must be equal');
        return;
      }

      // Validate all lines have accounts
      const invalidLines = lines.filter(line => !line.accountId || line.amount <= 0);
      if (invalidLines.length > 0) {
        message.error('Please ensure all lines have valid accounts and amounts greater than zero');
        return;
      }

      const journalEntryData = {
        date: values.date.format('YYYY-MM-DD'),
        reference: values.reference,
        description: values.description,
        lines: lines.map(line => ({
          accountId: line.accountId,
          type: line.type,
          amount: Number(line.amount),
          description: line.description,
        })),
      };

      if (isEditing) {
        await updateJournalEntry.mutateAsync({
          id: journalEntry!.id,
          data: journalEntryData,
        });
        message.success('Journal entry updated successfully');
      } else {
        await createJournalEntry.mutateAsync(journalEntryData);
        message.success('Journal entry created successfully');
      }

      onSuccess();
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || 'Failed to save journal entry');
    }
  };

  const lineColumns = [
    {
      title: 'Account',
      dataIndex: 'accountId',
      key: 'accountId',
      width: 250,
      render: (accountId: string, record: JournalEntryLineForm) => (
        <Select
          placeholder="Select Account"
          value={accountId}
          onChange={(value) => handleAccountSelect(record.id, value)}
          className="w-full"
          showSearch
          optionFilterProp="children"
        >
          {accounts?.map(account => (
            <Option key={account.id} value={account.id}>
              {account.code} - {account.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: JournalEntryLineType, record: JournalEntryLineForm) => (
        <Select
          value={type}
          onChange={(value) => handleLineChange(record.id, 'type', value)}
          className="w-full"
        >
          <Option value={JournalEntryLineType.DEBIT}>Debit</Option>
          <Option value={JournalEntryLineType.CREDIT}>Credit</Option>
        </Select>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount: number, record: JournalEntryLineForm) => (
        <InputNumber
          min={0}
          step={0.01}
          value={amount}
          onChange={(value) => handleLineChange(record.id, 'amount', value || 0)}
          className="w-full"
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => parseFloat((value || '').replace(/\$\s?|(,*)/g, '')) || 0}
        />
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string, record: JournalEntryLineForm) => (
        <Input
          value={description}
          onChange={(e) => handleLineChange(record.id, 'description', e.target.value)}
          placeholder="Optional description"
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_: unknown, record: JournalEntryLineForm) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveLine(record.id)}
        />
      ),
    },
  ];

  return (
    <Modal
      title={isEditing ? 'Edit Journal Entry' : 'Create Journal Entry'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={1000}
      okText={isEditing ? 'Update' : 'Create'}
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select a date' }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="reference"
              label="Reference"
            >
              <Input placeholder="Reference number" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea rows={2} placeholder="Journal entry description..." />
        </Form.Item>

        <Divider>Journal Entry Lines</Divider>

        {!isBalanced && lines.length > 0 && (
          <Alert
            message="Unbalanced Entry"
            description={`Debits: ${formatCurrency(debitTotal)} | Credits: ${formatCurrency(creditTotal)} | Difference: ${formatCurrency(Math.abs(debitTotal - creditTotal))}`}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        {isBalanced && (
          <Alert
            message="Balanced Entry"
            description={`Total: ${formatCurrency(debitTotal)}`}
            type="success"
            showIcon
            className="mb-4"
          />
        )}

        <div className="mb-4">
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddLine}
            className="w-full"
          >
            Add Line
          </Button>
        </div>

        <Table
          columns={lineColumns}
          dataSource={lines}
          rowKey="id"
          pagination={false}
          size="small"
        />

        <Divider />

        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Total Debits:</Text>
            <Text strong className="ml-2 text-green-600">
              {formatCurrency(debitTotal)}
            </Text>
          </Col>
          <Col span={12}>
            <Text strong>Total Credits:</Text>
            <Text strong className="ml-2 text-blue-600">
              {formatCurrency(creditTotal)}
            </Text>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

