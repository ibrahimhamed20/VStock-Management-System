import React from 'react';
import { Typography, Empty } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SalesTrend } from '../types';
import { formatCurrency, formatNumber } from '../../common/utils';

const { Text } = Typography;

interface SalesTrendChartProps {
  data: SalesTrend[];
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Empty
        description="No sales trend data available"
        className="py-8"
      />
    );
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: Array<{ value: number; payload: { growth: number } }>, label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <Text strong className="text-gray-900">{label}</Text>
          <div className="mt-1">
            <div className="text-blue-600">
              Sales: {formatCurrency(payload[0].value)}
            </div>
            <div className="text-green-600">
              Invoices: {formatNumber(payload[1].value)}
            </div>
            <div className="text-purple-600">
              Growth: {payload[0].payload.growth.toFixed(1)}%
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            yAxisId="sales"
            orientation="left"
            stroke="#2563eb"
            fontSize={12}
            tickFormatter={(value: number) => `$${value / 1000}k`}
          />
          <YAxis 
            yAxisId="invoices"
            orientation="right"
            stroke="#10b981"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            yAxisId="sales"
            type="monotone"
            dataKey="sales"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
          />
          <Line
            yAxisId="invoices"
            type="monotone"
            dataKey="invoices"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
