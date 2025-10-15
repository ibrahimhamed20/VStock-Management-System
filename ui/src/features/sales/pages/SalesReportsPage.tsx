import React, { useState } from 'react';
import dayjs from 'dayjs';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  DatePicker, 
  Button, 
  Select, 
  Space,
  Statistic,
  Table,
  Tag,
  message
} from 'antd';
import { 
  DownloadOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  RiseOutlined,
  FallOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { 
  useSalesReport, 
  useOverdueInvoices, 
  useTopProducts, 
  useSalesTrend,
  usePaymentMethodStats,
  useClientPerformance
} from '../hooks';
import { formatCurrency, formatDate } from '../../common/utils';
// import { PaymentStatus } from '../types';
import { SalesTrendChart } from '../components/SalesTrendChart';
import { TopProductsChart } from '../components/TopProductsChart';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const SalesReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<[string, string] | undefined>(undefined);
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'analytics'>('summary');

  // Calculate default date range (last 30 days)
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);

  const filters = {
    startDate: dateRange?.[0] || defaultStartDate.toISOString().split('T')[0],
    endDate: dateRange?.[1] || defaultEndDate.toISOString().split('T')[0],
  };

  const { data: salesReport } = useSalesReport(filters);
  const { data: overdueInvoices, isLoading: overdueLoading } = useOverdueInvoices();
  const { data: topProducts } = useTopProducts();
  const { data: salesTrend } = useSalesTrend();
  const { data: paymentMethods, isLoading: paymentLoading } = usePaymentMethodStats();
  const { data: clientPerformance, isLoading: clientLoading } = useClientPerformance();

  const handleExportReport = () => {
    message.info('Export functionality will be implemented');
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([
        dates[0].format('YYYY-MM-DD'),
        dates[1].format('YYYY-MM-DD')
      ]);
    } else {
      setDateRange(undefined);
    }
  };

  const overdueColumns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text: string) => <Text strong className="text-blue-600">{text}</Text>,
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Remaining',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      align: 'right' as const,
      render: (amount: number) => (
        <Text className="text-red-600">{formatCurrency(amount)}</Text>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Days Overdue',
      key: 'daysOverdue',
      render: (_: unknown, record: { dueDate: Date | string }) => {
        const dueDate = new Date(record.dueDate);
        const today = new Date();
        const diffTime = today.getTime() - dueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return (
          <Tag color={diffDays > 30 ? 'red' : diffDays > 7 ? 'orange' : 'yellow'}>
            {diffDays} days
          </Tag>
        );
      },
    },
  ];

  const paymentMethodColumns = [
    {
      title: 'Payment Method',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => (
        <Tag color="blue">{method.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
      align: 'right' as const,
    },
    {
      title: 'Total Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Percentage',
      key: 'percentage',
      align: 'right' as const,
      render: (_: unknown, record: { amount: number }) => {
        const total = paymentMethods?.reduce((sum, pm) => sum + pm.amount, 0) || 0;
        const percentage = total > 0 ? ((record.amount / total) * 100).toFixed(1) : '0.0';
        return `${percentage}%`;
      },
    },
  ];

  const clientPerformanceColumns = [
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Total Invoices',
      dataIndex: 'totalInvoices',
      key: 'totalInvoices',
      align: 'right' as const,
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Average Invoice',
      key: 'averageInvoice',
      align: 'right' as const,
      render: (_: unknown, record: { totalInvoices?: number; totalAmount: number }) => {
        const average = (record.totalInvoices && record.totalInvoices > 0) ? record.totalAmount / (record.totalInvoices || 1) : 0;
        return formatCurrency(average);
      },
    },
    {
      title: 'Last Purchase',
      dataIndex: 'lastPurchase',
      key: 'lastPurchase',
      render: (date: string) => date ? formatDate(date) : 'N/A',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="text-gray-900 mb-2">
            Sales Reports & Analytics
          </Title>
          <Text className="text-gray-600 text-lg">
            Comprehensive sales analysis, performance metrics, and business insights
          </Text>
        </div>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportReport}
          >
            Export Report
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Space>
              <CalendarOutlined />
              <Text strong>Date Range:</Text>
            </Space>
            <RangePicker
              value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
              onChange={handleDateRangeChange}
              className="w-full mt-2 h-10"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <BarChartOutlined />
              <Text strong>Report Type:</Text>
            </Space>
            <Select
              value={reportType}
              onChange={setReportType}
              className="w-full mt-2 h-10"
            >
              <Select.Option value="summary">Summary Report</Select.Option>
              <Select.Option value="detailed">Detailed Report</Select.Option>
              <Select.Option value="analytics">Analytics Report</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      {reportType === 'summary' && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center">
                <Statistic
                  title="Total Sales"
                  value={salesReport?.totalSales || 0}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<DollarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center">
                <Statistic
                  title="Total Invoices"
                  value={salesReport?.totalInvoices || 0}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center">
                <Statistic
                  title="Paid Invoices"
                  value={salesReport?.paidInvoices || 0}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<RiseOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center">
                <Statistic
                  title="Pending Invoices"
                  value={salesReport?.pendingInvoices || 0}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<FallOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center">
                <Statistic
                  title="Overdue Invoices"
                  value={salesReport?.overdueInvoices || 0}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center">
                <Statistic
                  title="Average Invoice Value"
                  value={salesReport?.averageInvoiceValue || 0}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center">
                <Statistic
                  title="Collection Rate"
                  value={salesReport?.totalInvoices ? 
                    ((salesReport.paidInvoices / salesReport.totalInvoices) * 100).toFixed(1) : 0}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center">
                <Statistic
                  title="Overdue Amount"
                  value={overdueInvoices?.reduce((sum, invoice) => sum + invoice.remainingAmount, 0) || 0}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Sales Trend" className="h-full">
            <SalesTrendChart data={salesTrend || []} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top Products" className="h-full">
            <TopProductsChart data={topProducts || []} />
          </Card>
        </Col>
      </Row>

      {/* Detailed Reports */}
      {reportType === 'detailed' && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Overdue Invoices" className="h-full">
              <Table
                columns={overdueColumns}
                dataSource={overdueInvoices || []}
                loading={overdueLoading}
                pagination={{ pageSize: 10 }}
                size="small"
                scroll={{ x: 600 }}
                rowKey="id"
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Payment Methods" className="h-full">
              <Table
                columns={paymentMethodColumns}
                dataSource={paymentMethods || []}
                loading={paymentLoading}
                pagination={false}
                size="small"
                rowKey="method"
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Analytics Reports */}
      {reportType === 'analytics' && (
        <Card title="Client Performance Analysis">
          <Table
            columns={clientPerformanceColumns}
            dataSource={clientPerformance || []}
            loading={clientLoading}
            pagination={{ pageSize: 15 }}
            scroll={{ x: 800 }}
            rowKey="clientName"
          />
        </Card>
      )}
    </div>
  );
};
