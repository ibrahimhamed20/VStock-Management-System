// Components
export { Dashboard } from './components/Dashboard';
export { SystemStatusCard } from './components/SystemStatusCard';
export { LowStockAlert } from './components/LowStockAlert';
export { PendingInvoicesCard } from './components/PendingInvoicesCard';

// Hooks
export { 
  useDashboardData,
  useDashboardStats,
  useSystemStatus,
  useRecentOrders,
  useTopProducts,
  useLowStockProducts,
  usePendingInvoices,
  useFinancialSummary
} from './hooks/useDashboard';

// Services
export { DashboardService } from './services/dashboardService';

// Types
export type {
  DashboardStats,
  SystemStatus,
  RecentOrder,
  TopProduct,
  LowStockProduct,
  PendingInvoice
} from './services/dashboardService';
