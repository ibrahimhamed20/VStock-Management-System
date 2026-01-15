import React, { useState } from 'react';
import {
  Card,
  Form,
  DatePicker,
  Button,
  Row,
  Col,
  Table,
  Typography,
  Space,
  Divider,
  Select,
  message,
  Spin,
  Statistic,
} from 'antd';
import {
  AccountBookOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { useBalanceSheet, useIncomeStatement, useCashFlowStatement } from '../hooks';
import { reportsService } from '../services';
import type { ExportFormat } from '../types';
import { PrintReport } from '../components/PrintReport';
import { useSettings } from '../../settings/hooks';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export const FinancialReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [reportType, setReportType] = useState<'balance-sheet' | 'income-statement' | 'cash-flow'>('balance-sheet');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [fiscalYear, setFiscalYear] = useState<string>('');

  const filter = {
    startDate: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
    endDate: dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined,
    fiscalYear: fiscalYear || undefined,
  };

  const { data: balanceSheet, isLoading: loadingBalanceSheet } = useBalanceSheet(
    reportType === 'balance-sheet' ? filter : {}
  );
  const { data: incomeStatement, isLoading: loadingIncomeStatement } = useIncomeStatement(
    reportType === 'income-statement' ? filter : {}
  );
  const { data: cashFlow, isLoading: loadingCashFlow } = useCashFlowStatement(
    reportType === 'cash-flow' ? filter : {}
  );

  const isLoading = loadingBalanceSheet || loadingIncomeStatement || loadingCashFlow;
  const { data: settings } = useSettings();

  const handleExport = async (format: ExportFormat) => {
    try {
      const blob = await reportsService.exportReport(reportType, format, filter);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      message.error('Export failed. Please try again.');
      console.error('Export error:', error);
    }
  };

  const balanceSheetColumns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Account Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (value: number | undefined) => `$${Number(value ?? 0).toFixed(2)}`,
      align: 'right' as const,
    },
  ];

  const incomeStatementColumns = [
    {
      title: 'Account ID',
      dataIndex: 'accountId',
      key: 'accountId',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number) => `$${value.toFixed(2)}`,
      align: 'right' as const,
    },
  ];

  const cashFlowColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Account',
      dataIndex: 'accountName',
      key: 'accountName',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => type.toUpperCase(),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number) => `$${Math.abs(value).toFixed(2)}`,
      align: 'right' as const,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <Card className="shadow-lg border-0 rounded-xl w-full mx-auto">
        <Space className="mb-6 w-full" direction="vertical" size="small">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/reports')}
            className="p-0"
          >
            Back to Reports
          </Button>
          <Space>
            <AccountBookOutlined className="text-3xl text-blue-600" />
            <div>
              <Title level={2} className="mb-0">
                Financial Reports
              </Title>
              <Text type="secondary">Balance Sheet, Income Statement, and Cash Flow reports</Text>
            </div>
          </Space>
        </Space>

        <Divider />

        <Form form={form} layout="vertical">
          <Row gutter={24} className="mb-6">
            <Col xs={24} sm={8}>
              <Form.Item label="Report Type">
                <Select
                  value={reportType}
                  onChange={setReportType}
                  size="large"
                >
                  <Option value="balance-sheet">Balance Sheet</Option>
                  <Option value="income-statement">Income Statement</Option>
                  <Option value="cash-flow">Cash Flow Statement</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Date Range">
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
                  size="large"
                  className="w-full"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Fiscal Year (Optional)">
                <Select
                  value={fiscalYear}
                  onChange={setFiscalYear}
                  placeholder="Select fiscal year"
                  size="large"
                  allowClear
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <Option key={year} value={year.toString()}>
                        {year}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Space className="mb-6">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => {
                form.validateFields();
              }}
              size="large"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Generate Report
            </Button>
            {reportType === 'balance-sheet' && balanceSheet && (
              <PrintReport reportType={reportType} report={balanceSheet} settings={settings} />
            )}
            {reportType === 'income-statement' && incomeStatement && (
              <PrintReport reportType={reportType} report={incomeStatement} settings={settings} />
            )}
            {reportType === 'cash-flow' && cashFlow && (
              <PrintReport reportType={reportType} report={cashFlow} settings={settings} />
            )}
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleExport('pdf')}
              size="large"
              disabled={isLoading}
            >
              Export PDF
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleExport('excel')}
              size="large"
              disabled={isLoading}
            >
              Export Excel
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleExport('csv')}
              size="large"
              disabled={isLoading}
            >
              Export CSV
            </Button>
          </Space>
        </Form>

        <Divider />

        <Spin spinning={isLoading}>
          {reportType === 'balance-sheet' && balanceSheet && (
            <div>
              <Row gutter={16} className="mb-6">
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Total Assets"
                    value={balanceSheet.totalAssets}
                    prefix="$"
                    precision={2}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Total Liabilities"
                    value={balanceSheet.totalLiabilities}
                    prefix="$"
                    precision={2}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Total Equity"
                    value={balanceSheet.totalEquity}
                    prefix="$"
                    precision={2}
                  />
                </Col>
              </Row>

              <Title level={4}>Assets</Title>
              <Table
                dataSource={balanceSheet.assets}
                columns={balanceSheetColumns}
                rowKey="code"
                pagination={false}
                className="mb-6"
              />

              <Title level={4}>Liabilities</Title>
              <Table
                dataSource={balanceSheet.liabilities}
                columns={balanceSheetColumns}
                rowKey="code"
                pagination={false}
                className="mb-6"
              />

              <Title level={4}>Equity</Title>
              <Table
                dataSource={balanceSheet.equity}
                columns={balanceSheetColumns}
                rowKey="code"
                pagination={false}
              />
            </div>
          )}

          {reportType === 'income-statement' && incomeStatement && (
            <div>
              <Row gutter={16} className="mb-6">
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Total Revenue"
                    value={incomeStatement.totalRevenue}
                    prefix="$"
                    precision={2}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Total Expenses"
                    value={incomeStatement.totalExpenses}
                    prefix="$"
                    precision={2}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Net Income"
                    value={incomeStatement.netIncome}
                    prefix="$"
                    precision={2}
                    valueStyle={{
                      color: incomeStatement.netIncome >= 0 ? '#3f8600' : '#cf1322',
                    }}
                  />
                </Col>
              </Row>

              <Title level={4}>Revenue</Title>
              <Table
                dataSource={incomeStatement.revenue}
                columns={incomeStatementColumns}
                rowKey="accountId"
                pagination={false}
                className="mb-6"
              />

              <Title level={4}>Expenses</Title>
              <Table
                dataSource={incomeStatement.expenses}
                columns={incomeStatementColumns}
                rowKey="accountId"
                pagination={false}
              />
            </div>
          )}

          {reportType === 'cash-flow' && cashFlow && (
            <div>
              <Row gutter={16} className="mb-6">
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Cash Inflows"
                    value={cashFlow.inflows}
                    prefix="$"
                    precision={2}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Cash Outflows"
                    value={cashFlow.outflows}
                    prefix="$"
                    precision={2}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Net Cash Flow"
                    value={cashFlow.netCashFlow}
                    prefix="$"
                    precision={2}
                    valueStyle={{
                      color: cashFlow.netCashFlow >= 0 ? '#3f8600' : '#cf1322',
                    }}
                  />
                </Col>
              </Row>

              <Title level={4}>Cash Flow Details</Title>
              <Table
                dataSource={cashFlow.details}
                columns={cashFlowColumns}
                rowKey={(record, index) => `${record.date}-${index}`}
                pagination={{ pageSize: 20 }}
              />
            </div>
          )}

          {!isLoading && !balanceSheet && !incomeStatement && !cashFlow && (
            <div className="text-center py-12">
              <Text type="secondary">Select filters and generate a report to view data</Text>
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
};

