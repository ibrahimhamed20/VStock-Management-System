# Dashboard Module

A comprehensive dashboard that provides real-time insights into your store management system, integrating with all available backend APIs.

## 🚀 Features

### **Real-time Statistics**
- **Revenue Overview**: Total revenue, expenses, and net income
- **Inventory Status**: Product counts and low stock alerts
- **Customer Metrics**: Total customers and active orders
- **Financial Health**: Pending invoices and payments

### **System Monitoring**
- **System Status**: Real-time health monitoring
- **Performance Metrics**: Uptime, memory usage, and system performance
- **Auto-refresh**: Automatic data updates every 30 seconds to 5 minutes

### **Business Intelligence**
- **Recent Orders**: Latest order status and progress tracking
- **Top Products**: Best-performing products with sales metrics
- **Low Stock Alerts**: Products requiring immediate attention
- **Pending Invoices**: Overdue and upcoming payment tracking

### **Quick Actions**
- **Inventory Management**: Direct access to product management
- **Sales Operations**: Quick invoice creation
- **Purchase Orders**: Supplier and procurement management
- **Reports & Analytics**: Financial and business insights

## 🏗️ Architecture

### **Component Structure**
```
dashboard/
├── components/
│   ├── Dashboard.tsx           # Main dashboard orchestrator
│   ├── SystemStatusCard.tsx    # System health monitoring
│   ├── LowStockAlert.tsx       # Inventory alerts
│   └── PendingInvoicesCard.tsx # Payment tracking
├── hooks/
│   └── useDashboard.ts         # React Query hooks for data fetching
├── services/
│   └── dashboardService.ts     # API integration layer
├── types/                      # TypeScript interfaces
└── index.ts                    # Module exports
```

### **Data Flow**
1. **React Query Hooks** → Manage server state and caching
2. **Dashboard Service** → API calls to backend endpoints
3. **Component State** → Local UI state and user interactions
4. **Real-time Updates** → Automatic data refresh and synchronization

## 🔌 Backend Integration

### **API Endpoints Used**
- **System**: `/api/status` - System health and performance
- **Inventory**: `/api/inventory/products`, `/api/inventory/stock/low-stock`
- **Sales**: `/api/sales/invoices` - Order and payment data
- **Customers**: `/api/clients` - Customer information
- **Reports**: `/api/reports/balance-sheet`, `/api/reports/income-statement`

### **Data Transformation**
- **Real-time Calculations**: Revenue, expenses, and profit margins
- **Smart Aggregations**: Product performance and customer metrics
- **Status Mapping**: Order progress and payment status tracking
- **Date Processing**: Overdue calculations and due date management

## 🎨 UI/UX Features

### **Responsive Design**
- **Mobile-First**: Optimized for all screen sizes
- **Grid Layout**: Flexible card-based design system
- **Touch-Friendly**: Optimized for mobile and tablet interactions

### **Visual Elements**
- **Gradient Cards**: Modern, eye-catching statistics display
- **Progress Indicators**: Visual order status and completion tracking
- **Color-Coded Alerts**: Status-based color schemes for quick recognition
- **Interactive Elements**: Hover effects and smooth transitions

### **Loading States**
- **Skeleton Screens**: Smooth loading animations
- **Error Handling**: Graceful error states with retry options
- **Data Validation**: Safe rendering with fallback values

## 🚦 Performance Optimizations

### **React Query Features**
- **Smart Caching**: Intelligent data caching and invalidation
- **Background Updates**: Non-blocking data refresh
- **Optimistic Updates**: Immediate UI feedback for better UX
- **Error Boundaries**: Graceful error handling and recovery

### **Data Management**
- **Stale Time Control**: Configurable data freshness policies
- **Refetch Intervals**: Automatic data updates based on importance
- **Memory Management**: Efficient data storage and cleanup

## 📱 Usage Examples

### **Basic Dashboard Display**
```tsx
import { Dashboard } from '@/features/dashboard';

function App() {
  return (
    <div>
      <Dashboard />
    </div>
  );
}
```

### **Individual Components**
```tsx
import { SystemStatusCard, LowStockAlert } from '@/features/dashboard';

function CustomLayout() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <SystemStatusCard />
      <LowStockAlert />
      <PendingInvoicesCard />
    </div>
  );
}
```

### **Custom Hooks**
```tsx
import { useDashboardStats, useSystemStatus } from '@/features/dashboard';

function CustomComponent() {
  const { stats, isLoading } = useDashboardStats();
  const { data: systemStatus } = useSystemStatus();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Revenue: ${stats?.totalRevenue}</h2>
      <p>System: {systemStatus?.status}</p>
    </div>
  );
}
```

## 🔧 Configuration

### **Environment Variables**
```env
# API Configuration
VITE_API_BASE_URL=/api
VITE_DASHBOARD_REFRESH_INTERVAL=30000
```

### **Customization Options**
- **Refresh Intervals**: Configurable update frequencies
- **Data Sources**: Easy to add new API endpoints
- **UI Themes**: Customizable color schemes and layouts
- **Component Props**: Flexible component configuration

## 🧪 Testing

### **Component Testing**
```tsx
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';

test('renders dashboard with loading state', () => {
  render(<Dashboard />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
```

### **Hook Testing**
```tsx
import { renderHook } from '@testing-library/react';
import { useDashboardStats } from './hooks/useDashboard';

test('returns dashboard statistics', () => {
  const { result } = renderHook(() => useDashboardStats());
  expect(result.current.isLoading).toBe(true);
});
```

## 🚀 Future Enhancements

### **Planned Features**
- **Real-time Charts**: Interactive data visualizations
- **Custom Dashboards**: User-configurable widget layouts
- **Export Functionality**: PDF/Excel report generation
- **Mobile App**: Native mobile dashboard experience

### **Integration Opportunities**
- **WebSocket Support**: Live data streaming
- **Push Notifications**: Real-time alerts and updates
- **Advanced Analytics**: Machine learning insights
- **Third-party Integrations**: External service connections

## 📚 Dependencies

- **React Query**: Server state management
- **Ant Design**: UI component library
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Type safety and development experience

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

## 📄 License

This module is part of the Store Management System and follows the same licensing terms.
