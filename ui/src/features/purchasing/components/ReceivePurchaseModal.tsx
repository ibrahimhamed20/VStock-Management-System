import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Table,
  InputNumber,
  Button,
  Typography,
  Space,
  message,
  Alert,
} from 'antd';
import {
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { Purchase, PurchaseItem } from '../types';
import { useReceivePurchase } from '../hooks';
import { formatCurrency } from '../../common/utils';

const { Text } = Typography;

interface ReceivePurchaseModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  purchase: Purchase | null;
}

interface ReceiveItemForm {
  itemId: string;
  productName: string;
  productSku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  maxQuantity: number;
}

export const ReceivePurchaseModal: React.FC<ReceivePurchaseModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  purchase
}) => {
  const [form] = Form.useForm();
  const [receiveItems, setReceiveItems] = useState<ReceiveItemForm[]>([]);
  const receivePurchase = useReceivePurchase();

  useEffect(() => {
    if (visible && purchase) {
      const items: ReceiveItemForm[] = purchase.items.map(item => ({
        itemId: item.id,
        productName: item.productName,
        productSku: item.productSku,
        orderedQuantity: item.quantity,
        receivedQuantity: item.receivedQuantity || 0,
        maxQuantity: item.quantity,
      }));
      setReceiveItems(items);
    }
  }, [visible, purchase]);

  const handleQuantityChange = (itemId: string, value: number | null) => {
    const newItems = receiveItems.map(item => {
      if (item.itemId === itemId) {
        const newQuantity = value || 0;
        return {
          ...item,
          receivedQuantity: Math.min(Math.max(0, newQuantity), item.maxQuantity),
        };
      }
      return item;
    });
    setReceiveItems(newItems);
  };

  const handleSubmit = async () => {
    try {
      if (!purchase) return;

      const receivedItemsData = receiveItems
        .filter(item => item.receivedQuantity > 0)
        .map(item => ({
          itemId: item.itemId,
          receivedQuantity: item.receivedQuantity,
        }));

      if (receivedItemsData.length === 0) {
        message.warning('Please enter received quantities for at least one item');
        return;
      }

      await receivePurchase.mutateAsync({
        id: purchase.id,
        data: { receivedItems: receivedItemsData },
      });

      message.success('Goods received successfully');
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(errorMessage || 'Failed to receive goods');
    }
  };

  if (!purchase) return null;

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_: unknown, record: ReceiveItemForm) => (
        <div>
          <Text strong>{record.productName}</Text>
          <br />
          <Text type="secondary" className="text-sm">
            SKU: {record.productSku}
          </Text>
        </div>
      ),
    },
    {
      title: 'Ordered Qty',
      dataIndex: 'orderedQuantity',
      key: 'orderedQuantity',
      align: 'center' as const,
      render: (qty: number) => <Text strong>{qty}</Text>,
    },
    {
      title: 'Already Received',
      dataIndex: 'receivedQuantity',
      key: 'receivedQuantity',
      align: 'center' as const,
      render: (received: number, record: ReceiveItemForm) => {
        const alreadyReceived = purchase.items.find(i => i.id === record.itemId)?.receivedQuantity || 0;
        return (
          <Text type={alreadyReceived > 0 ? 'success' : 'secondary'}>
            {alreadyReceived}
          </Text>
        );
      },
    },
    {
      title: 'Receiving Now',
      key: 'receiving',
      align: 'center' as const,
      render: (_: unknown, record: ReceiveItemForm) => {
        const alreadyReceived = purchase.items.find(i => i.id === record.itemId)?.receivedQuantity || 0;
        const remaining = record.maxQuantity - alreadyReceived;
        
        return (
          <InputNumber
            min={0}
            max={remaining}
            value={record.receivedQuantity}
            onChange={(value) => handleQuantityChange(record.itemId, value)}
            placeholder="0"
            style={{ width: '100px' }}
          />
        );
      },
    },
    {
      title: 'Total Received',
      key: 'total',
      align: 'center' as const,
      render: (_: unknown, record: ReceiveItemForm) => {
        const alreadyReceived = purchase.items.find(i => i.id === record.itemId)?.receivedQuantity || 0;
        const total = alreadyReceived + record.receivedQuantity;
        const isComplete = total >= record.maxQuantity;
        
        return (
          <Text strong className={isComplete ? 'text-green-600' : ''}>
            {total} / {record.maxQuantity}
          </Text>
        );
      },
    },
  ];

  const totalOrdered = receiveItems.reduce((sum, item) => sum + item.orderedQuantity, 0);
  const totalReceiving = receiveItems.reduce((sum, item) => sum + item.receivedQuantity, 0);
  const alreadyReceived = purchase.items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);

  return (
    <Modal
      title={
        <Space>
          <CheckCircleOutlined className="text-green-600" />
          <span>Receive Goods - {purchase.purchaseNumber}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={900}
      okText="Receive Goods"
      cancelText="Cancel"
      confirmLoading={receivePurchase.isPending}
    >
      <div className="space-y-4">
        <Alert
          message="Receiving Goods"
          description={`Enter the quantities received for each item. Purchase order must be in ORDERED status.`}
          type="info"
          showIcon
          className="mb-4"
        />

        <div className="mb-4">
          <Space>
            <Text strong>Supplier:</Text>
            <Text>{purchase.supplierName}</Text>
          </Space>
          <br />
          <Space>
            <Text strong>Expected Delivery:</Text>
            <Text>{new Date(purchase.expectedDeliveryDate).toLocaleDateString()}</Text>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={receiveItems}
          rowKey="itemId"
          pagination={false}
          size="small"
        />

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full">
            <div className="flex justify-between">
              <Text>Total Ordered:</Text>
              <Text strong>{totalOrdered} units</Text>
            </div>
            <div className="flex justify-between">
              <Text>Already Received:</Text>
              <Text type="success">{alreadyReceived} units</Text>
            </div>
            <div className="flex justify-between">
              <Text>Receiving Now:</Text>
              <Text strong className="text-blue-600">{totalReceiving} units</Text>
            </div>
            <div className="flex justify-between border-t pt-2">
              <Text strong>Total After Receipt:</Text>
              <Text strong className="text-green-600">
                {alreadyReceived + totalReceiving} / {totalOrdered} units
              </Text>
            </div>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

