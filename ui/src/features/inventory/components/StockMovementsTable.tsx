import React, { useState } from 'react';
import { Table, Card, Typography, Tag, Input, Select, Button, Row, Col } from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  InboxOutlined, 
  MinusOutlined, 
  PlusOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useStockMovements } from '../hooks/useInventory';
import type { StockMovement } from '../types/inventory.types';

const { Title, Text } = Typography;
const { Option } = Select;

interface StockMovementsTableProps {
  productId?: string;
  maxItems?: number;
}

export const StockMovementsTable: React.FC<StockMovementsTableProps> = ({
  productId,
  maxItems = 50
}) => {
  const [filters, setFilters] = useState({
    type: undefined as string | undefined,
    search: '',
  });

  const { data: movements, isLoading, error, refetch } = useStockMovements({
    productId,
    limit: maxItems
  });

  const getMovementType = (quantity: number) => {
    return quantity > 0 ? 'Stock In' : 'Stock Out';
  };

  const getMovementIcon = (quantity: number) => {
    return quantity > 0 ? 
      <PlusOutlined className="text-green-500" /> : 
      <MinusOutlined className="text-red-500" />;
  };

  const getMovementColor = (quantity: number) => {
    return quantity > 0 ? 'green' : 'red';
  };

  const filteredMovements = movements?.filter(movement => {
    const movementType = getMovementType(movement.quantity);
    const matchesType = !filters.type || movementType === filters.type;
    const matchesSearch = !filters.search || 
      movement.productName.toLowerCase().includes(filters.search.toLowerCase()) ||
      movement.reason.toLowerCase().includes(filters.search.toLowerCase()) ||
      movement.reference?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesType && matchesSearch;
  }) || [];

  const movementColumns = [
    {
      title: 'Product',
      key: 'product',
      render: (movement: StockMovement) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <InboxOutlined className="text-white text-sm" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{movement.productName}</div>
            <div className="text-sm text-gray-500">ID: {movement.productId}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      render: (movement: StockMovement) => (
        <Tag 
          color={getMovementColor(movement.quantity)}
          icon={getMovementIcon(movement.quantity)}
          className="font-medium"
        >
          {getMovementType(movement.quantity)}
        </Tag>
      ),
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (movement: StockMovement) => (
        <div className={`font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
        </div>
      ),
    },
    {
      title: 'Reason',
      key: 'reason',
      render: (movement: StockMovement) => (
        <div>
          <div className="font-medium text-gray-900">{movement.reason}</div>
          {movement.reference && (
            <div className="text-sm text-gray-500">Ref: {movement.reference}</div>
          )}
        </div>
      ),
    },
    {
      title: 'User',
      key: 'user',
      render: (movement: StockMovement) => (
        <div className="flex items-center space-x-2">
          <UserOutlined className="text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">{movement.username}</div>
            <div className="text-sm text-gray-500">ID: {movement.userId}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Date',
      key: 'date',
      render: (movement: StockMovement) => (
        <div className="flex items-center space-x-2">
          <CalendarOutlined className="text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">
              {new Date(movement.createdAt).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(movement.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
        <div className="text-center py-8">
          <Text type="danger">Error loading stock movements</Text>
          <br />
          <Button onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="mb-0">Stock Movements</Title>
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            className="rounded-xl"
          >
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Row gutter={16} className="mb-4">
          <Col span={12}>
            <Input
              placeholder="Search movements..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Filter by type"
              value={filters.type}
              onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              className="w-full rounded-xl"
              allowClear
            >
              <Option value="IN">
                <div className="flex items-center space-x-2">
                  <PlusOutlined className="text-green-500" />
                  <span>Stock In</span>
                </div>
              </Option>
              <Option value="OUT">
                <div className="flex items-center space-x-2">
                  <MinusOutlined className="text-red-500" />
                  <span>Stock Out</span>
                </div>
              </Option>
            </Select>
          </Col>
          <Col span={6}>
            <div className="text-sm text-gray-500 flex items-center h-full">
              {filteredMovements.length} movements
            </div>
          </Col>
        </Row>
      </div>

      <Table
        columns={movementColumns}
        dataSource={filteredMovements}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} movements`,
          className: "rounded-xl"
        }}
        className="rounded-xl"
        size="small"
      />
    </Card>
  );
};
