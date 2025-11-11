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
  BarChartOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { 
  usePurchaseReport, 
  useOverduePurchases, 
  useTopSuppliers, 
  usePurchaseTrend,
  useSupplierPerformance
} from '../hooks';
import { formatCurrency, formatDate } from '../../common/utils';
import { PurchaseTrendChart } from '../components/PurchaseTrendChart';
import { TopSuppliersChart } from '../components/TopSuppliersChart';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const PurchasingReportsPage: React.FC = () => {
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

  const { data: purchaseReport } = usePurchaseReport(filters);
  const { data: overduePurchases, isLoading: overdueLoading } = useOverduePurchases();
  const { data: topSuppliers } = useTopSuppliers(10);
  const { data: purchaseTrend } = usePurchaseTrend(12);
  const { data: supplierPerformance, isLoading: supplierLoading } = useSupplierPerformance();

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
      title: 'Purchase #',
      dataIndex: 'purchaseNumber',
      key: 'purchaseNumber',
      render: (text: string) => <Text strong className="text-blue-600">{text}</Text>,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
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
      title: 'Expected Delivery',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      render: (date: Date | string) => formatDate(date),
    },
    {
      title: 'Days Overdue',
      key: 'daysOverdue',
      render: (_: unknown, record: { expectedDeliveryDate: Date | string }) => {
        const expectedDate = new Date(record.expectedDeliveryDate);
        const today = new Date();
        const diffTime = today.getTime() - expectedDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return (
          <Tag color={diffDays > 30 ? 'red' : diffDays > 7 ? 'orange' : 'yellow'}>
            {diffDays} days
          </Tag>
        );
      },
    },
  ];

  const supplierPerformanceColumns = [
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Total Purchases',
      dataIndex: 'purchases',
      key: 'purchases',
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
      title: 'Average Order',
      dataIndex: 'averageAmount',
      key: 'averageAmount',
      align: 'right' as const,
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'On-Time Delivery',
      dataIndex: 'onTimeDeliveryRate',
      key: 'onTimeDeliveryRate',
      align: 'right' as const,
      render: (rate: number) => (
        <Tag color={rate >= 90 ? 'green' : rate >= 70 ? 'orange' : 'red'}>
          {rate.toFixed(1)}%
        </Tag>
      ),
    },
    {
      title: 'Last Purchase',
      dataIndex: 'lastPurchase',
      key: 'lastPurchase',
      render: (date: Date) => formatDate(date),
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
            Purchasing Reports & Analytics
          </Title>
          <Text className="text-gray-600 text-lg">
            Comprehensive procurement analytics, supplier performance, and purchase insights
          </Text>
        </div>

        {/* Filters */}
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Space>
                <CalendarOutlined />
                <Text strong>Date Range:</Text>
              </Space>
              <RangePicker
                placeholder={['Start Date', 'End Date']}
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
                <Select.Option value="analytics">Analytics</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4} className='self-end'>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportReport}
                className="w-full mt-2 h-10 bg-blue-600 hover:bg-blue-700"
              >
                Export
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Summary Statistics */}
        {reportType === 'summary' && (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100">
                  <Statistic
                    title="Total Purchases"
                    value={purchaseReport?.totalPurchases || 0}
                    prefix={<ShoppingCartOutlined />}
                    valueStyle={{ color: '#2563eb' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100">
                  <Statistic
                    title="Total Amount"
                    value={purchaseReport?.totalAmount || 0}
                    prefix={<DollarOutlined />}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{ color: '#059669' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-orange-50 to-amber-100">
                  <Statistic
                    title="Pending Orders"
                    value={purchaseReport?.pendingPurchases || 0}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#ea580c' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-purple-50 to-violet-100">
                  <Statistic
                    title="Received Orders"
                    value={purchaseReport?.receivedPurchases || 0}
                    prefix={<RiseOutlined />}
                    valueStyle={{ color: '#7c3aed' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={12}>
                <Card className="shadow-lg border-0 rounded-xl">
                  <Statistic
                    title="Average Purchase Value"
                    value={purchaseReport?.averagePurchaseValue || 0}
                    prefix={<DollarOutlined />}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{ color: '#2563eb', fontSize: '24px' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12}>
                <Card className="shadow-lg border-0 rounded-xl">
                  <Statistic
                    title="Overdue Purchases"
                    value={overduePurchases?.length || 0}
                    prefix={<FallOutlined />}
                    valueStyle={{ color: '#dc2626', fontSize: '24px' }}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Analytics Section */}
        {reportType === 'analytics' && (
          <Row gutter={[16, 16]} align="stretch">
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <RiseOutlined className="text-blue-600" />
                    <span>Purchase Trend</span>
                  </Space>
                }
                className="shadow-lg border-0 rounded-xl h-full min-h-[400px]"
              >
                <PurchaseTrendChart data={purchaseTrend || []} />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <DollarOutlined className="text-green-600" />
                    <span>Top Suppliers</span>
                  </Space>
                }
                className="shadow-lg border-0 rounded-xl h-full min-h-[400px]"
              >
                <TopSuppliersChart data={topSuppliers || []} />
              </Card>
            </Col>
          </Row>
        )}

        {/* Overdue Purchases */}
        {overduePurchases && overduePurchases.length > 0 && (
          <Card 
            title={
              <Space>
                <FallOutlined className="text-red-600" />
                <span>Overdue Purchases</span>
                <Tag color="red">{overduePurchases.length}</Tag>
              </Space>
            }
            className="shadow-lg border-0 rounded-xl"
          >
            <Table
              columns={overdueColumns}
              dataSource={overduePurchases}
              rowKey="id"
              loading={overdueLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `${total} overdue purchases`,
              }}
            />
          </Card>
        )}

        {/* Supplier Performance */}
        {reportType === 'analytics' && (
          <Card 
            title={
              <Space>
                <BarChartOutlined className="text-purple-600" />
                <span>Supplier Performance</span>
              </Space>
            }
            className="shadow-lg border-0 rounded-xl"
          >
            <Table
              columns={supplierPerformanceColumns}
              dataSource={supplierPerformance}
              rowKey="supplierId"
              loading={supplierLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `${total} suppliers`,
              }}
            />
          </Card>
        )}

        {/* Top Suppliers Table */}
        {reportType === 'detailed' && purchaseReport?.topSuppliers && (
          <Card 
            title={
              <Space>
                <ShoppingCartOutlined className="text-blue-600" />
                <span>Top Suppliers</span>
              </Space>
            }
            className="shadow-lg border-0 rounded-xl"
          >
            <Table
              columns={[
                {
                  title: 'Supplier',
                  dataIndex: 'supplierName',
                  key: 'supplierName',
                  render: (text: string) => <Text strong>{text}</Text>,
                },
                {
                  title: 'Purchases',
                  dataIndex: 'purchases',
                  key: 'purchases',
                  align: 'right' as const,
                },
                {
                  title: 'Total Amount',
                  dataIndex: 'totalAmount',
                  key: 'totalAmount',
                  align: 'right' as const,
                  render: (amount: number) => formatCurrency(amount),
                },
              ]}
              dataSource={purchaseReport.topSuppliers}
              rowKey="supplierId"
              pagination={false}
            />
          </Card>
        )}

        {/* Purchases by Period */}
        {reportType === 'detailed' && purchaseReport?.purchasesByPeriod && (
          <Card 
            title={
              <Space>
                <CalendarOutlined className="text-green-600" />
                <span>Purchases by Period</span>
              </Space>
            }
            className="shadow-lg border-0 rounded-xl"
          >
            <Table
              columns={[
                {
                  title: 'Period',
                  dataIndex: 'period',
                  key: 'period',
                  render: (text: string) => <Text strong>{text}</Text>,
                },
                {
                  title: 'Purchases',
                  dataIndex: 'purchases',
                  key: 'purchases',
                  align: 'right' as const,
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  align: 'right' as const,
                  render: (amount: number) => formatCurrency(amount),
                },
              ]}
              dataSource={purchaseReport.purchasesByPeriod}
              rowKey="period"
              pagination={false}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

