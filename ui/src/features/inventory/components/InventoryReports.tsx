import React, { useState } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, Tag, Progress, Alert, Spin, Button } from 'antd';
import {
  BarChartOutlined,
  DollarOutlined,
  ShoppingOutlined,
  TagsOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import { useStockValueReport, useABCClassificationReport, useStockAlerts } from '../hooks/useInventory';
import type { ABCClassification } from '../types/inventory.types';

const { Title, Text } = Typography;

export const InventoryReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<'overview' | 'abc' | 'alerts'>('overview');

  const { data: stockValueReport, isLoading: isLoadingStockValue } = useStockValueReport();
  const { data: abcReport, isLoading: isLoadingABC } = useABCClassificationReport();
  const { data: stockAlerts, isLoading: isLoadingAlerts } = useStockAlerts();

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'A': return 'red';
      case 'B': return 'orange';
      case 'C': return 'green';
      default: return 'default';
    }
  };

  const abcColumns = [
    {
      title: 'Classification',
      key: 'classification',
      render: (item: ABCClassification) => (
        <Tag
          color={getClassificationColor(item.classification)}
          className="font-medium text-lg px-4 py-2"
        >
          Class {item.classification}
        </Tag>
      ),
    },
    {
      title: 'Products Count',
      key: 'count',
      render: (item: ABCClassification) => (
        <div className="font-medium text-gray-900">
          {item.products.length} products
        </div>
      ),
    },
    {
      title: 'Total Value',
      key: 'value',
      render: (item: ABCClassification) => (
        <div className="font-medium text-gray-900">
          ${item.totalValue.toLocaleString()}
        </div>
      ),
    },
    {
      title: 'Percentage',
      key: 'percentage',
      render: (item: ABCClassification) => (
        <div className="flex items-center space-x-2">
          <Progress
            percent={item.percentage}
            size="small"
            strokeColor={getClassificationColor(item.classification)}
            className="flex-1"
          />
          <Text strong>{item.percentage?.toFixed(1)}%</Text>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Report Navigation */}
      <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
        <div className="flex justify-center space-x-4">
          <Button
            type={selectedReport === 'overview' ? 'primary' : 'default'}
            size="large"
            icon={<BarChartOutlined />}
            onClick={() => setSelectedReport('overview')}
            className="rounded-xl"
          >
            Overview
          </Button>
          <Button
            type={selectedReport === 'abc' ? 'primary' : 'default'}
            size="large"
            icon={<TagsOutlined />}
            onClick={() => setSelectedReport('abc')}
            className="rounded-xl"
          >
            ABC Analysis
          </Button>
          <Button
            type={selectedReport === 'alerts' ? 'primary' : 'default'}
            size="large"
            icon={<FallOutlined />}
            onClick={() => setSelectedReport('alerts')}
            className="rounded-xl"
          >
            Stock Alerts
          </Button>
        </div>
      </Card>

      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Stock Value Summary */}
          <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
            <Title level={4} className="mb-6">Stock Value Summary</Title>
            {isLoadingStockValue ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <div className="mt-4">
                  <Text type="secondary">Loading stock value report...</Text>
                </div>
              </div>
            ) : stockValueReport ? (
              <div>
                <Row gutter={16} className="mb-6">
                  <Col span={6}>
                    <Statistic
                      title="Total Products"
                      value={stockValueReport.totalProducts}
                      prefix={<ShoppingOutlined className="text-blue-500" />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Total Stock Value"
                      value={stockValueReport.totalValue}
                      prefix={<DollarOutlined className="text-green-500" />}
                      precision={2}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Average Value"
                      value={stockValueReport.averageValue}
                      prefix={<RiseOutlined className="text-purple-500" />}
                      precision={2}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Categories"
                      value={Object.keys(stockValueReport.categoryBreakdown).length}
                      prefix={<TagsOutlined className="text-orange-500" />}
                    />
                  </Col>
                </Row>

                {/* Category Breakdown */}
                <div>
                  <Title level={5} className="mb-4">Category Breakdown</Title>
                  <Row gutter={16}>
                    {Object.entries(stockValueReport.categoryBreakdown).map(([category, data]) => (
                      <Col span={8} key={category} className="mb-4">
                        <Card size="small" className="hover:shadow-md transition-shadow">
                          <div className="text-center">
                            <div className="font-medium text-gray-900 mb-2">{category}</div>
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              ${data.value.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {data.count} products
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>
            ) : (
              <Alert
                message="No data available"
                description="Stock value report data is not available"
                type="info"
                showIcon
              />
            )}
          </Card>
        </div>
      )}

      {/* ABC Classification Report */}
      {selectedReport === 'abc' && (
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
          <Title level={4} className="mb-6">ABC Classification Report</Title>
          {isLoadingABC ? (
            <div className="text-center py-8">
              <Spin size="large" />
              <div className="mt-4">
                <Text type="secondary">Loading ABC classification report...</Text>
              </div>
            </div>
          ) : abcReport && abcReport.length > 0 ? (
            <div>
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <Text type="secondary">
                  ABC analysis categorizes inventory items based on their value contribution:
                </Text>
                <ul className="mt-2 text-sm text-gray-600">
                  <li><strong>Class A:</strong> High-value items (typically 20% of items, 80% of value)</li>
                  <li><strong>Class B:</strong> Medium-value items (typically 30% of items, 15% of value)</li>
                  <li><strong>Class C:</strong> Low-value items (typically 50% of items, 5% of value)</li>
                </ul>
              </div>
              <Table
                columns={abcColumns}
                dataSource={abcReport}
                rowKey="classification"
                pagination={false}
                className="rounded-xl"
              />
            </div>
          ) : (
            <Alert
              message="No data available"
              description="ABC classification report data is not available"
              type="info"
              showIcon
            />
          )}
        </Card>
      )}

      {/* Stock Alerts Report */}
      {selectedReport === 'alerts' && (
        <div className="space-y-6">
          <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
            <Title level={4} className="mb-6">Stock Alerts Summary</Title>
            {isLoadingAlerts ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <div className="mt-4">
                  <Text type="secondary">Loading stock alerts...</Text>
                </div>
              </div>
            ) : stockAlerts ? (
              <div>
                <Row gutter={16} className="mb-6">
                  <Col span={12}>
                    <Statistic
                      title="Low Stock Products"
                      value={stockAlerts.lowStockCount}
                      prefix={<FallOutlined className="text-orange-500" />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Expiring Batches"
                      value={stockAlerts.expiringCount}
                      prefix={<FallOutlined className="text-red-500" />}
                    />
                  </Col>
                </Row>

                {/* Low Stock Products */}
                {stockAlerts.lowStockProducts.length > 0 && (
                  <div className="mb-6">
                    <Title level={5} className="mb-4">Low Stock Products</Title>
                    <div className="space-y-2">
                      {stockAlerts.lowStockProducts.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Current: {product.currentStock}</div>
                            <div className="text-sm text-gray-500">Min: {product.minStock}</div>
                            <div className="text-sm text-red-600 font-medium">Deficit: {product.deficit}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expiring Batches */}
                {stockAlerts.expiringBatches.length > 0 && (
                  <div>
                    <Title level={5} className="mb-4">Expiring Batches</Title>
                    <div className="space-y-2">
                      {stockAlerts.expiringBatches.map(batch => (
                        <div key={batch.batchId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{batch.productName}</div>
                            <div className="text-sm text-gray-500">Batch: {batch.batchId}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Qty: {batch.remainingQuantity}</div>
                            <div className="text-sm text-gray-500">
                              Expires: {new Date(batch.expiryDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-red-600 font-medium">
                              {batch.daysUntilExpiry <= 0 ? 'Expired' : `${batch.daysUntilExpiry} days left`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Alert
                message="No alerts"
                description="No stock alerts at this time"
                type="success"
                showIcon
              />
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
