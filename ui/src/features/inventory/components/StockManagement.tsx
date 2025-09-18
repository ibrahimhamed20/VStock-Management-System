import React, { useState } from 'react';
import { Card, Typography, Button, Space, Row, Col, Statistic, Alert, Tabs } from 'antd';
import { 
  PlusOutlined, 
  InboxOutlined, 
  HistoryOutlined, 
  ExclamationCircleOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { Form } from 'antd';
import { useLowStockProducts } from '../hooks/useInventory';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { StockMovementsTable } from './StockMovementsTable';
import type { Product } from '../types/inventory.types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export const StockManagement: React.FC = () => {
  const [stockForm] = Form.useForm();
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: lowStockProducts, isLoading: isLoadingLowStock } = useLowStockProducts();

  const openStockModal = (product?: Product) => {
    setSelectedProduct(product || null);
    if (product) {
      stockForm.setFieldsValue({
        productId: product.id,
      });
    } else {
      stockForm.resetFields();
    }
    setStockModalVisible(true);
  };

  const getStockStatusColor = (product: Product) => {
    if (product.stock === 0) return 'red';
    if (product.stock <= product.minStock) return 'orange';
    return 'green';
  };

  const getStockStatusText = (product: Product) => {
    if (product.stock === 0) return 'Out of Stock';
    if (product.stock <= product.minStock) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="space-y-6">

      {/* Quick Actions */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                <PlusOutlined className="text-white text-2xl" />
              </div>
              <Title level={4} className="mb-2">Stock In</Title>
              <Text type="secondary" className="block mb-4">
                Add stock to inventory
              </Text>
              <Button 
                type="primary" 
                size="large"
                onClick={() => openStockModal()}
                className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Add Stock
              </Button>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                <InboxOutlined className="text-white text-2xl" />
              </div>
              <Title level={4} className="mb-2">Stock Out</Title>
              <Text type="secondary" className="block mb-4">
                Remove stock from inventory
              </Text>
              <Button 
                type="primary" 
                size="large"
                onClick={() => openStockModal()}
                className="rounded-xl bg-gradient-to-r from-red-500 to-pink-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Remove Stock
              </Button>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                <HistoryOutlined className="text-white text-2xl" />
              </div>
              <Title level={4} className="mb-2">View Movements</Title>
              <Text type="secondary" className="block mb-4">
                Track all stock changes
              </Text>
              <Button 
                type="primary" 
                size="large"
                onClick={() => {/* Scroll to movements tab */}}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                View History
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Low Stock Alert */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <Alert
          message={`${lowStockProducts.length} products are low on stock`}
          description={
            <div className="mt-2">
              {lowStockProducts.slice(0, 3).map(product => (
                <div key={product.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-2">
                    <ShoppingOutlined className="text-orange-500" />
                    <Text strong>{product.name}</Text>
                    <Text type="secondary">({product.sku})</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Text type="secondary">Stock: {product.stock}</Text>
                    <Text type="secondary">Min: {product.minStock}</Text>
                    <Button 
                      size="small" 
                      type="link"
                      onClick={() => openStockModal(product)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Adjust
                    </Button>
                  </div>
                </div>
              ))}
              {lowStockProducts.length > 3 && (
                <Text type="secondary" className="text-sm">
                  ... and {lowStockProducts.length - 3} more
                </Text>
              )}
            </div>
          }
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          className="mb-6"
        />
      )}

      {/* Main Content */}
      <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
        <Tabs defaultActiveKey="movements" size="large">
          <TabPane 
            tab={
              <span>
                <HistoryOutlined />
                Stock Movements
              </span>
            } 
            key="movements"
          >
            <StockMovementsTable />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <ExclamationCircleOutlined />
                Low Stock Products
              </span>
            } 
            key="low-stock"
          >
            <div className="space-y-4">
              {isLoadingLowStock ? (
                <div className="text-center py-8">
                  <Text type="secondary">Loading low stock products...</Text>
                </div>
              ) : lowStockProducts && lowStockProducts.length > 0 ? (
                lowStockProducts.map(product => (
                  <Card key={product.id} size="small" className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                          <ShoppingOutlined className="text-white text-lg" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Current Stock</div>
                          <div className="font-medium text-orange-600">{product.stock}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Min Stock</div>
                          <div className="font-medium">{product.minStock}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Deficit</div>
                          <div className="font-medium text-red-600">{product.minStock - product.stock}</div>
                        </div>
                        <Button 
                          type="primary" 
                          size="small"
                          onClick={() => openStockModal(product)}
                          className="rounded-lg"
                        >
                          Adjust Stock
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <Text type="secondary">No low stock products found</Text>
                </div>
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        visible={stockModalVisible}
        onCancel={() => {
          setStockModalVisible(false);
          setSelectedProduct(null);
          stockForm.resetFields();
        }}
        product={selectedProduct}
        form={stockForm}
      />
    </div>
  );
};
