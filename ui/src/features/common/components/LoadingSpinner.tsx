import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'default' | 'large';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = 'Loading...', 
  size = 'default',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Spin 
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} 
        size={size}
      />
      {text && (
        <div className="mt-4 text-gray-600 text-center">
          {text}
        </div>
      )}
    </div>
  );
};
