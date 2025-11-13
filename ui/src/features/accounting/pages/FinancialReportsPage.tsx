import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Select, 
  Typography, 
  Row, 
  Col,
  Space,
  Tag,
  Divider,
  Button,
  message,
  DatePicker,
  Spin,
} from 'antd';
import { 
  DownloadOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  AccountBookOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTrialBalance, useGeneralLedger, useAccounts, useBalanceSheet, useIncomeStatement, useCashFlowStatement } from '../hooks';
import { AccountType } from '../types';
import { formatCurrency } from '../../common/utils';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export const FinancialReportsPage: React.FC = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);
  const [reportType, setReportType] = useState<'trial-balance' | 'general-ledger' | 'balance-sheet' | 'income-statement' | 'cash-flow'>('trial-balance');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const { data: trialBalance, isLoading: balanceLoading } = useTrialBalance();
  const { data: generalLedger, isLoading: ledgerLoading } = useGeneralLedger(selectedAccountId || '');
  const { data: accounts } = useAccounts();
  const { data: balanceSheet, isLoading: balanceSheetLoading } = useBalanceSheet(startDate, endDate);
  const { data: incomeStatement, isLoading: incomeStatementLoading } = useIncomeStatement(startDate, endDate);
  const { data: cashFlow, isLoading: cashFlowLoading } = useCashFlowStatement(startDate, endDate);

  const handleExportReport = () => {
    message.info('Export functionality will be implemented');
  };

  const trialBalanceColumns = [
    {
      title: 'Account Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => (
        <Text strong className="text-blue-600">{code}</Text>
      ),
    },
    {
      title: 'Account Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: AccountType) => {
        const colors: Record<AccountType, string> = {
          [AccountType.ASSET]: 'blue',
          [AccountType.LIABILITY]: 'red',
          [AccountType.EQUITY]: 'green',
          [AccountType.REVENUE]: 'cyan',
          [AccountType.EXPENSE]: 'orange',
        };
        return (
          <Tag color={colors[type]}>
            {type.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Debit',
      key: 'debit',
      width: 150,
      align: 'right' as const,
      render: (_: unknown, record: { type: AccountType; balance: number }) => {
        const isDebitAccount = record.type === AccountType.ASSET || record.type === AccountType.EXPENSE;
        return isDebitAccount && record.balance > 0 ? (
          <Text strong className="text-green-600">
            {formatCurrency(record.balance)}
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
    {
      title: 'Credit',
      key: 'credit',
      width: 150,
      align: 'right' as const,
      render: (_: unknown, record: { type: AccountType; balance: number }) => {
        const isCreditAccount = record.type === AccountType.LIABILITY || 
                                record.type === AccountType.EQUITY || 
                                record.type === AccountType.REVENUE;
        return isCreditAccount && record.balance > 0 ? (
          <Text strong className="text-blue-600">
            {formatCurrency(record.balance)}
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
  ];

  const generalLedgerColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: Date | string) => new Date(date).toLocaleDateString(),
    },
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
      title: 'Debit',
      key: 'debit',
      width: 150,
      align: 'right' as const,
      render: (_: unknown, record: { lines: Array<{ type: string; amount: number; accountId: string }> }) => {
        const accountLine = record.lines.find(line => line.accountId === selectedAccountId);
        if (accountLine && accountLine.type === 'debit') {
          return (
            <Text strong className="text-green-600">
              {formatCurrency(accountLine.amount)}
            </Text>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      title: 'Credit',
      key: 'credit',
      width: 150,
      align: 'right' as const,
      render: (_: unknown, record: { lines: Array<{ type: string; amount: number; accountId: string }> }) => {
        const accountLine = record.lines.find(line => line.accountId === selectedAccountId);
        if (accountLine && accountLine.type === 'credit') {
          return (
            <Text strong className="text-blue-600">
              {formatCurrency(accountLine.amount)}
            </Text>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      title: 'Balance',
      key: 'balance',
      width: 150,
      align: 'right' as const,
      render: (_: unknown, _record: { lines: Array<{ type: string; amount: number; accountId: string }> }, index: number) => {
        // Calculate running balance
        let balance = 0;
        const entries = generalLedger?.entries || [];
        for (let i = 0; i <= index; i++) {
          const entry = entries[i];
          const accountLine = entry?.lines.find(line => line.accountId === selectedAccountId);
          if (accountLine) {
            if (accountLine.type === 'debit') {
              balance += Number(accountLine.amount);
            } else {
              balance -= Number(accountLine.amount);
            }
          }
        }
        return (
          <Text strong className={balance >= 0 ? 'text-green-600' : 'text-red-600'}>
            {formatCurrency(balance)}
          </Text>
        );
      },
    },
  ];

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
            Financial Reports
          </Title>
          <Text className="text-gray-600 text-lg">
            View trial balance, general ledger, and financial statements
          </Text>
        </div>

        {/* Filters */}
        <Card>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Space>
                <FileTextOutlined />
                <Text strong>Report Type:</Text>
              </Space>
              <Select
                value={reportType}
                onChange={setReportType}
                className="w-full mt-2"
                size="large"
              >
                <Option value="trial-balance">Trial Balance</Option>
                <Option value="general-ledger">General Ledger</Option>
                <Option value="balance-sheet">Balance Sheet</Option>
                <Option value="income-statement">Income Statement</Option>
                <Option value="cash-flow">Cash Flow Statement</Option>
              </Select>
            </Col>
            {(reportType === 'balance-sheet' || reportType === 'income-statement' || reportType === 'cash-flow') && (
              <Col xs={24} sm={12} md={10}>
                <Space>
                  <FileTextOutlined />
                  <Text strong>Date Range:</Text>
                </Space>
                <RangePicker
                  placeholder={['Start Date', 'End Date']}
                  value={startDate && endDate 
                    ? [dayjs(startDate), dayjs(endDate)] as [dayjs.Dayjs, dayjs.Dayjs]
                    : null}
                  onChange={(dates) => {
                    setStartDate(dates?.[0]?.format('YYYY-MM-DD'));
                    setEndDate(dates?.[1]?.format('YYYY-MM-DD'));
                  }}
                  className="w-full mt-2"
                  size="large"
                />
              </Col>
            )}
            {reportType === 'general-ledger' && (
              <Col xs={24} sm={12} md={12}>
                <Space>
                  <AccountBookOutlined />
                  <Text strong>Account:</Text>
                </Space>
                <Select
                  placeholder="Select Account"
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
            )}
            <Col xs={24} sm={12} md={6} className='self-end'>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportReport}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                size="large"
              >
                Export
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Trial Balance Report */}
        {reportType === 'trial-balance' && (
          <Card 
            title={
              <Space>
                <CalculatorOutlined className="text-blue-600" />
                <span>Trial Balance</span>
              </Space>
            }
            className="shadow-lg border-0 rounded-xl"
          >
            <Table
              columns={trialBalanceColumns}
              dataSource={trialBalance?.summary || []}
              rowKey="code"
              loading={balanceLoading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `${total} accounts`,
              }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>Total</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong className="text-green-600">
                        {formatCurrency(trialBalance?.totalDebits || 0)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <Text strong className="text-blue-600">
                        {formatCurrency(trialBalance?.totalCredits || 0)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />

            <Divider />

            <div className="text-center">
              <Tag 
                color={trialBalance?.totalDebits === trialBalance?.totalCredits ? 'green' : 'red'}
                className="text-lg p-2"
              >
                {trialBalance?.totalDebits === trialBalance?.totalCredits 
                  ? '✓ Trial Balance is Balanced' 
                  : '✗ Trial Balance is Unbalanced'}
              </Tag>
            </div>
          </Card>
        )}

        {/* General Ledger Report */}
        {reportType === 'general-ledger' && (
          <Card 
            title={
              <Space>
                <AccountBookOutlined className="text-green-600" />
                <span>General Ledger</span>
                {selectedAccountId && generalLedger?.account && (
                  <Text type="secondary">
                    - {generalLedger.account.code} - {generalLedger.account.name}
                  </Text>
                )}
              </Space>
            }
            className="shadow-lg border-0 rounded-xl"
          >
            {!selectedAccountId ? (
              <div className="text-center py-8">
                <Text type="secondary">Please select an account to view the general ledger</Text>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Text type="secondary">Account Code:</Text>
                      <br />
                      <Text strong>{generalLedger?.account.code}</Text>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary">Account Name:</Text>
                      <br />
                      <Text strong>{generalLedger?.account.name}</Text>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary">Current Balance:</Text>
                      <br />
                      <Text strong className="text-blue-600">
                        {formatCurrency(generalLedger?.account.balance || 0)}
                      </Text>
                    </Col>
                  </Row>
                </div>

                <Table
                  columns={generalLedgerColumns}
                  dataSource={generalLedger?.entries || []}
                  rowKey="id"
                  loading={ledgerLoading}
                  pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) => `${total} entries`,
                  }}
                />
              </>
            )}
          </Card>
        )}

        {/* Balance Sheet Report */}
        {reportType === 'balance-sheet' && (
          <Card 
            title={
              <Space>
                <CalculatorOutlined className="text-blue-600" />
                <span>Balance Sheet</span>
                {balanceSheet && (
                  <Text type="secondary" className="text-sm">
                    As of {balanceSheet.asOfDate}
                  </Text>
                )}
              </Space>
            }
            className="shadow-lg border-0 rounded-xl"
          >
            {balanceSheetLoading ? (
              <div className="text-center py-8">
                <Spin />
              </div>
            ) : balanceSheet ? (
              <>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="Assets" className="h-full">
                      <Table
                        columns={[
                          { title: 'Account', dataIndex: 'name', key: 'name' },
                          { title: 'Code', dataIndex: 'code', key: 'code', width: 100 },
                          {
                            title: 'Amount',
                            dataIndex: 'balance',
                            key: 'balance',
                            align: 'right' as const,
                            render: (amount: number) => formatCurrency(amount),
                          },
                        ]}
                        dataSource={balanceSheet.assets}
                        rowKey="code"
                        pagination={false}
                        size="small"
                        summary={() => (
                          <Table.Summary fixed>
                            <Table.Summary.Row>
                              <Table.Summary.Cell index={0} colSpan={2}>
                                <Text strong>Total Assets</Text>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={1} align="right">
                                <Text strong className="text-blue-600">
                                  {formatCurrency(balanceSheet.totalAssets)}
                                </Text>
                              </Table.Summary.Cell>
                            </Table.Summary.Row>
                          </Table.Summary>
                        )}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Liabilities & Equity" className="h-full">
                      <Table
                        columns={[
                          { title: 'Account', dataIndex: 'name', key: 'name' },
                          { title: 'Code', dataIndex: 'code', key: 'code', width: 100 },
                          {
                            title: 'Amount',
                            dataIndex: 'balance',
                            key: 'balance',
                            align: 'right' as const,
                            render: (amount: number) => formatCurrency(amount),
                          },
                        ]}
                        dataSource={[...balanceSheet.liabilities, ...balanceSheet.equity]}
                        rowKey="code"
                        pagination={false}
                        size="small"
                        summary={() => (
                          <Table.Summary fixed>
                            <Table.Summary.Row>
                              <Table.Summary.Cell index={0} colSpan={2}>
                                <Text strong>Total Liabilities & Equity</Text>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={1} align="right">
                                <Text strong className="text-green-600">
                                  {formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}
                                </Text>
                              </Table.Summary.Cell>
                            </Table.Summary.Row>
                          </Table.Summary>
                        )}
                      />
                    </Card>
                  </Col>
                </Row>
                <Divider />
                <div className="text-center">
                  <Tag 
                    color={balanceSheet.isBalanced ? 'green' : 'red'}
                    className="text-lg p-2"
                  >
                    {balanceSheet.isBalanced 
                      ? '✓ Balance Sheet is Balanced' 
                      : '✗ Balance Sheet is Unbalanced'}
                  </Tag>
                </div>
              </>
            ) : null}
          </Card>
        )}

        {/* Income Statement Report */}
        {reportType === 'income-statement' && (
          <Card 
            title={
              <Space>
                <CalculatorOutlined className="text-green-600" />
                <span>Income Statement</span>
                {incomeStatement && (
                  <Text type="secondary" className="text-sm">
                    {incomeStatement.period.startDate 
                      ? `${incomeStatement.period.startDate} to ${incomeStatement.period.endDate}`
                      : `As of ${incomeStatement.period.endDate}`}
                  </Text>
                )}
              </Space>
            }
            className="shadow-lg border-0 rounded-xl"
          >
            {incomeStatementLoading ? (
              <div className="text-center py-8">
                <Spin />
              </div>
            ) : incomeStatement ? (
              <>
                <Card title="Revenue" className="mb-4">
                  <Table
                    columns={[
                      { title: 'Account', dataIndex: 'name', key: 'name' },
                      { title: 'Code', dataIndex: 'code', key: 'code', width: 100 },
                      {
                        title: 'Amount',
                        dataIndex: 'balance',
                        key: 'balance',
                        align: 'right' as const,
                        render: (amount: number) => formatCurrency(amount),
                      },
                    ]}
                    dataSource={incomeStatement.revenue}
                    rowKey="code"
                    pagination={false}
                    size="small"
                    summary={() => (
                      <Table.Summary fixed>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={2}>
                            <Text strong>Total Revenue</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <Text strong className="text-green-600">
                              {formatCurrency(incomeStatement.totalRevenue)}
                            </Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                </Card>
                <Card title="Expenses" className="mb-4">
                  <Table
                    columns={[
                      { title: 'Account', dataIndex: 'name', key: 'name' },
                      { title: 'Code', dataIndex: 'code', key: 'code', width: 100 },
                      {
                        title: 'Amount',
                        dataIndex: 'balance',
                        key: 'balance',
                        align: 'right' as const,
                        render: (amount: number) => formatCurrency(amount),
                      },
                    ]}
                    dataSource={incomeStatement.expenses}
                    rowKey="code"
                    pagination={false}
                    size="small"
                    summary={() => (
                      <Table.Summary fixed>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={2}>
                            <Text strong>Total Expenses</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <Text strong className="text-red-600">
                              {formatCurrency(incomeStatement.totalExpenses)}
                            </Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                </Card>
                <Divider />
                <div className="text-center">
                  <Text strong className="text-lg">Net Income: </Text>
                  <Text 
                    strong 
                    className={`text-lg ${incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(incomeStatement.netIncome)}
                  </Text>
                </div>
              </>
            ) : null}
          </Card>
        )}

        {/* Cash Flow Statement Report */}
        {reportType === 'cash-flow' && (
          <Card 
            title={
              <Space>
                <CalculatorOutlined className="text-purple-600" />
                <span>Cash Flow Statement</span>
                {cashFlow && (
                  <Text type="secondary" className="text-sm">
                    {cashFlow.period.startDate 
                      ? `${cashFlow.period.startDate} to ${cashFlow.period.endDate}`
                      : `As of ${cashFlow.period.endDate}`}
                  </Text>
                )}
              </Space>
            }
            className="shadow-lg border-0 rounded-xl"
          >
            {cashFlowLoading ? (
              <div className="text-center py-8">
                <Spin />
              </div>
            ) : cashFlow ? (
              <>
                <Row gutter={[16, 16]} className="mb-4">
                  <Col span={8}>
                    <Card>
                      <Text type="secondary">Beginning Cash</Text>
                      <Title level={4} className="mt-2">
                        {formatCurrency(cashFlow.beginningCash)}
                      </Title>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Text type="secondary">Net Cash Flow</Text>
                      <Title 
                        level={4} 
                        className={`mt-2 ${cashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {formatCurrency(cashFlow.netCashFlow)}
                      </Title>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Text type="secondary">Ending Cash</Text>
                      <Title level={4} className="mt-2 text-blue-600">
                        {formatCurrency(cashFlow.endingCash)}
                      </Title>
                    </Card>
                  </Col>
                </Row>

                <Card title="Operating Activities" className="mb-4">
                  <Table
                    columns={[
                      { title: 'Description', dataIndex: 'description', key: 'description' },
                      {
                        title: 'Amount',
                        dataIndex: 'amount',
                        key: 'amount',
                        align: 'right' as const,
                        render: (amount: number, record: { type: string }) => (
                          <Text className={record.type === 'inflow' ? 'text-green-600' : 'text-red-600'}>
                            {record.type === 'inflow' ? '+' : '-'}{formatCurrency(amount)}
                          </Text>
                        ),
                      },
                    ]}
                    dataSource={cashFlow.operatingActivities}
                    rowKey={(record, index) => `op-${index}`}
                    pagination={false}
                    size="small"
                    summary={() => (
                      <Table.Summary fixed>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0}>
                            <Text strong>Net Cash from Operations</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <Text strong className={cashFlow.operatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(cashFlow.operatingCashFlow)}
                            </Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                </Card>

                <Card title="Investing Activities" className="mb-4">
                  <Table
                    columns={[
                      { title: 'Description', dataIndex: 'description', key: 'description' },
                      {
                        title: 'Amount',
                        dataIndex: 'amount',
                        key: 'amount',
                        align: 'right' as const,
                        render: (amount: number, record: { type: string }) => (
                          <Text className={record.type === 'inflow' ? 'text-green-600' : 'text-red-600'}>
                            {record.type === 'inflow' ? '+' : '-'}{formatCurrency(amount)}
                          </Text>
                        ),
                      },
                    ]}
                    dataSource={cashFlow.investingActivities}
                    rowKey={(record, index) => `inv-${index}`}
                    pagination={false}
                    size="small"
                    summary={() => (
                      <Table.Summary fixed>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0}>
                            <Text strong>Net Cash from Investing</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <Text strong className={cashFlow.investingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(cashFlow.investingCashFlow)}
                            </Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                </Card>

                <Card title="Financing Activities" className="mb-4">
                  <Table
                    columns={[
                      { title: 'Description', dataIndex: 'description', key: 'description' },
                      {
                        title: 'Amount',
                        dataIndex: 'amount',
                        key: 'amount',
                        align: 'right' as const,
                        render: (amount: number, record: { type: string }) => (
                          <Text className={record.type === 'inflow' ? 'text-green-600' : 'text-red-600'}>
                            {record.type === 'inflow' ? '+' : '-'}{formatCurrency(amount)}
                          </Text>
                        ),
                      },
                    ]}
                    dataSource={cashFlow.financingActivities}
                    rowKey={(record, index) => `fin-${index}`}
                    pagination={false}
                    size="small"
                    summary={() => (
                      <Table.Summary fixed>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0}>
                            <Text strong>Net Cash from Financing</Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <Text strong className={cashFlow.financingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(cashFlow.financingCashFlow)}
                            </Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                </Card>
              </>
            ) : null}
          </Card>
        )}
      </div>
    </div>
  );
};

