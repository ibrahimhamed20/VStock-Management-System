import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: string; message: string; timestamp: string } {
    return {
      status: 'ok',
      message: 'Store Management API is running',
      timestamp: new Date().toISOString(),
    };
  }

  getSystemInfo(): {
    name: string;
    version: string;
    description: string;
    environment: string;
    timestamp: string;
  } {
    return {
      name: 'Store Management API',
      version: '1.0.0',
      description: 'Complete store management system with inventory, sales, purchasing, accounting, and reporting',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }

  getApiInfo(): {
    endpoints: string[];
    documentation: string;
    features: string[];
  } {
    return {
      endpoints: [
        '/auth - Authentication & Authorization',
        '/users - User Management',
        '/inventory - Product & Stock Management',
        '/sales - Sales & Invoicing',
        '/purchasing - Purchase Orders & Suppliers',
        '/clients - Customer Management',
        '/accounting - Financial Accounting',
        '/reports - Business Reports',
        '/settings - System Settings',
        '/ai - AI-Powered Insights',
      ],
      documentation: '/api/docs',
      features: [
        'User Authentication & Role-based Access',
        'Product Inventory Management',
        'Sales & Invoice Processing',
        'Purchase Order Management',
        'Customer Relationship Management',
        'Double-entry Accounting',
        'Financial Reporting',
        'AI-powered Analytics',
        'Multi-language Support',
        'Real-time Notifications',
      ],
    };
  }

  getStatus(): {
    status: string;
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    timestamp: string;
  } {
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    
    return {
      status: 'operational',
      uptime: process.uptime(),
      memory: {
        used: Math.round(usedMem / 1024 / 1024 * 100) / 100, // MB
        total: Math.round(totalMem / 1024 / 1024 * 100) / 100, // MB
        percentage: Math.round((usedMem / totalMem) * 100 * 100) / 100, // %
      },
      timestamp: new Date().toISOString(),
    };
  }
}
