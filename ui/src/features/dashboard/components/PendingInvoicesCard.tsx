import React from 'react';
import { Card, Typography, List, Tag, Button } from 'antd';
import { 
  FileTextOutlined, 
  ClockCircleOutlined,
  ArrowRightOutlined,
  DollarOutlined 
} from '@ant-design/icons';
import { usePendingInvoices } from '../hooks/useDashboard';

const { Text } = Typography;

export const PendingInvoicesCard: React.FC = () => {
  const { data: pendingInvoices, isLoading, error } = usePendingInvoices();

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 rounded-2xl">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-0 rounded-2xl border-red-200 bg-red-50">
        <div className="text-center">
          <FileTextOutlined className="text-red-500 text-2xl mb-2" />
          <Text className="text-red-600">Failed to load pending invoices</Text>
        </div>
      </Card>
    );
  }

  if (!pendingInvoices || pendingInvoices.length === 0) {
    return (
      <Card className="shadow-lg border-0 rounded-2xl border-green-200 bg-green-50">
        <div className="text-center">
          <FileTextOutlined className="text-green-500 text-2xl mb-2" />
          <Text className="text-green-600">No pending invoices!</Text>
        </div>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getOverdueColor = (dueDate: string) => {
    const daysOverdue = getDaysOverdue(dueDate);
    if (daysOverdue < 0) return 'error';
    if (daysOverdue <= 3) return 'warning';
    return 'default';
  };

  const getOverdueText = (dueDate: string) => {
    const daysOverdue = getDaysOverdue(dueDate);
    if (daysOverdue < 0) return `${Math.abs(daysOverdue)} days overdue`;
    if (daysOverdue === 0) return 'Due today';
    if (daysOverdue === 1) return 'Due tomorrow';
    return `Due in ${daysOverdue} days`;
  };

  const totalPendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <Card 
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ClockCircleOutlined className="text-orange-500 mr-2" />
            <span className="text-lg font-semibold">Pending Invoices</span>
          </div>
          <Tag color="orange" className="font-medium">
            {pendingInvoices.length} invoices
          </Tag>
        </div>
      }
      className="shadow-lg border-0 rounded-2xl h-full"
      extra={
        <Button 
          type="link" 
          icon={<ArrowRightOutlined />}
          onClick={() => window.location.href = '/sales'}
          className="text-orange-500 hover:text-orange-600"
        >
          View All
        </Button>
      }
    >
      {/* Total Pending Amount */}
      <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarOutlined className="text-orange-500 mr-2" />
            <Text className="text-orange-700 font-medium">Total Pending:</Text>
          </div>
          <Text className="text-orange-700 font-bold text-lg">
            ${totalPendingAmount.toLocaleString()}
          </Text>
        </div>
      </div>

      <List
        dataSource={pendingInvoices.slice(0, 5)}
        renderItem={(invoice) => {
          const overdueColor = getOverdueColor(invoice.dueDate);
          const overdueText = getOverdueText(invoice.dueDate);
          
          return (
            <List.Item className="px-0 py-3 border-b border-gray-100 last:border-b-0">
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <Text className="font-medium text-gray-800 block">
                      {invoice.invoiceNumber}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {invoice.clientName}
                    </Text>
                  </div>
                  <Tag color={overdueColor} className="ml-2">
                    {overdueText}
                  </Tag>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Text className="text-sm text-gray-600">Amount:</Text>
                    <Text className="font-medium text-gray-800 ml-1">
                      ${invoice.amount.toLocaleString()}
                    </Text>
                  </div>
                  
                  <div className="text-right">
                    <Text className="text-xs text-gray-400">
                      Due: {formatDate(invoice.dueDate)}
                    </Text>
                  </div>
                </div>
              </div>
            </List.Item>
          );
        }}
        locale={{
          emptyText: (
            <div className="text-center py-4">
              <FileTextOutlined className="text-gray-300 text-2xl mb-2" />
              <Text className="text-gray-500">No pending invoices</Text>
            </div>
          )
        }}
      />
      
      {pendingInvoices.length > 5 && (
        <div className="text-center pt-3 border-t border-gray-100">
          <Text className="text-sm text-gray-500">
            +{pendingInvoices.length - 5} more invoices pending
          </Text>
        </div>
      )}
    </Card>
  );
};
