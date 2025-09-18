import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Typography, 
  message, 
  Space, 
  Tag, 
  Popconfirm, 
  Row, 
  Col,
  Input,
  Select,
  Tooltip,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ShoppingOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Form } from 'antd';
import { useProducts } from '../hooks/useInventory';
import { useInventoryOperations } from '../hooks/useInventoryMutations';
import { InventoryStats } from '../components/InventoryStats';
import { LowStockAlert } from '../components/LowStockAlert';
import { ExpiringBatchesAlert } from '../components/ExpiringBatchesAlert';
import { ProductModal } from '../components/ProductModal';
import type { Product, InventoryFilters, ProductClassification } from '../types/inventory.types';

const { Title, Text } = Typography;
const { Option } = Select;

export const ProductsPage: React.FC = () => {
  const [productForm] = Form.useForm();
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    category: undefined,
    classification: undefined,
    supplier: undefined,
    isActive: undefined,
    lowStock: undefined
  });

  const { data: products, isLoading, error, refetch } = useProducts();
  const { 
    deleteProduct, 
    isDeletingProduct 
  } = useInventoryOperations();

  const openProductModal = (product?: Product) => {
    setEditingProduct(product || null);
    if (product) {
      productForm.setFieldsValue({
        name: product.name,
        description: product.description,
        unitCost: product.unitCost,
        sellingPrice: product.sellingPrice,
        minStock: product.minStock,
        maxStock: product.maxStock,
        category: product.category,
        supplier: product.supplier,
        isActive: product.isActive,
      });
    } else {
      productForm.resetFields();
    }
    setProductModalVisible(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      message.success('Product deleted successfully');
    } catch {
      message.error('Failed to delete product');
    }
  };

  const filteredProducts = products?.filter(product => {
    const matchesSearch = !filters.search || 
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.sku.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesClassification = !filters.classification || product.classification === filters.classification;
    const matchesSupplier = !filters.supplier || product.supplier === filters.supplier;
    const matchesActive = filters.isActive === undefined || product.isActive === filters.isActive;
    const matchesLowStock = !filters.lowStock || product.stock <= product.minStock;
    
    return matchesSearch && matchesCategory && matchesClassification && 
           matchesSupplier && matchesActive && matchesLowStock;
  }) || [];

  const getClassificationColor = (classification: ProductClassification) => {
    switch (classification) {
      case 'A': return 'red';
      case 'B': return 'orange';
      case 'C': return 'green';
      default: return 'default';
    }
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

  const productColumns = [
    {
      title: 'Product',
      key: 'product',
      render: (product: Product) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <ShoppingOutlined className="text-white text-lg" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{product.name}</div>
            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
            {product.description && (
              <div className="text-sm text-gray-400 truncate max-w-xs">
                {product.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Stock',
      key: 'stock',
      render: (product: Product) => (
        <div>
          <div className="font-medium text-gray-900">{product.stock}</div>
          <Tag 
            color={getStockStatusColor(product)}
            className="text-xs"
          >
            {getStockStatusText(product)}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Pricing',
      key: 'pricing',
      render: (product: Product) => (
        <div>
          <div className="text-sm">
            <Text strong>Cost: </Text>
            <Text className="text-green-600">${product.unitCost.toFixed(2)}</Text>
          </div>
          <div className="text-sm">
            <Text strong>Price: </Text>
            <Text className="text-blue-600">${product.sellingPrice.toFixed(2)}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Classification',
      key: 'classification',
      render: (product: Product) => (
        <Tag 
          color={getClassificationColor(product.classification)}
          className="font-medium"
        >
          Class {product.classification}
        </Tag>
      ),
    },
    {
      title: 'Category',
      key: 'category',
      render: (product: Product) => (
        <div>
          {product.category ? (
            <Tag color="blue">{product.category}</Tag>
          ) : (
            <Text type="secondary">No category</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (product: Product) => (
        <Tag color={product.isActive ? 'green' : 'red'}>
          {product.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (product: Product) => (
        <Space>
          <Tooltip title="Edit Product">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => openProductModal(product)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            />
          </Tooltip>

          <Tooltip title="Delete Product">
            <Popconfirm
              title="Delete this product?"
              description="This action cannot be undone."
              onConfirm={() => handleDeleteProduct(product.id)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okType="danger"
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                className="hover:bg-red-50"
                loading={isDeletingProduct}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <Alert
          message="Error Loading Products"
          description="Failed to load products data. Please try again."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={1} className="text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Products Management
          </Title>
          <Text className="text-gray-600 text-lg">
            Manage your product catalog, pricing, and inventory
          </Text>
        </div>

        {/* Statistics Cards */}
        <InventoryStats />

        {/* Alerts */}
        <LowStockAlert />
        <ExpiringBatchesAlert />

        {/* Main Content */}
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/80 backdrop-blur-sm">
          {/* Controls and Filters */}
          <Row gutter={16} align="middle" className="mb-6">
            <Col span={6}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => openProductModal()}
                size="large"
                className="h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-base px-6"
              >
                Add Product
              </Button>
            </Col>
            <Col span={6}>
              <Input
                placeholder="Search products..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                size="large"
                className="rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500"
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Category"
                value={filters.category}
                onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                size="large"
                className="w-full rounded-xl"
                allowClear
              >
                {/* Categories will be populated from API */}
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Classification"
                value={filters.classification}
                onChange={(value) => setFilters(prev => ({ ...prev, classification: value }))}
                size="large"
                className="w-full rounded-xl"
                allowClear
              >
                <Option value="A">Class A</Option>
                <Option value="B">Class B</Option>
                <Option value="C">Class C</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                size="large"
                className="h-12 rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-500 transition-all duration-200"
              >
                Refresh
              </Button>
            </Col>
          </Row>

          {/* Products Table */}
          <Table
            columns={productColumns}
            dataSource={filteredProducts}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`,
              className: "rounded-xl"
            }}
            className="rounded-xl"
          />
        </Card>

        {/* Product Modal */}
        <ProductModal
          visible={productModalVisible}
          onCancel={() => {
            setProductModalVisible(false);
            setEditingProduct(null);
            productForm.resetFields();
          }}
          editingProduct={editingProduct}
          form={productForm}
        />
      </div>
    </div>
  );
};
