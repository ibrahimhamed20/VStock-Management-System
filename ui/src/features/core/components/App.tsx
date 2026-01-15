import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from '@common/providers';
import { MainLayout } from '@core/layout';
import { LoginForm, RegisterForm, PasswordResetForm } from '@auth/components';
import { UserManagement, RoleManagement, PermissionMatrix, UserProfile } from '@features/users';
import { Dashboard } from '@features/dashboard';
import {
  ProductsPage,
  StockPage,
  BatchesPage,
  MovementsPage,
  ReportsPage
} from '@features/inventory/pages';
import { SalesPage, InvoiceManagementPage, PaymentManagementPage, SalesReportsPage } from '@features/sales/pages';
import { PurchasingPage, PurchaseManagementPage, SupplierManagementPage, PurchasingReportsPage } from '@features/purchasing/pages';
import { AccountingPage, AccountManagementPage, JournalEntryManagementPage, FinancialReportsPage as AccountingFinancialReportsPage, AccountReconciliationPage } from '@features/accounting/pages';
import { ClientsPage } from '@features/clients/pages';
import { ReportsPage as GeneralReportsPage, FinancialReportsPage } from '@features/reports/pages';
import {
  SettingsPage,
  BasicSettingsPage,
  CompanySettingsPage,
  InvoiceSettingsPage,
  DateTimeSettingsPage,
  InventorySettingsPage,
  EmailSettingsPage,
  PrintSettingsPage,
  NumberFormatSettingsPage,
  SecuritySettingsPage,
  NotificationSettingsPage,
  BackupSettingsPage,
  BusinessHoursSettingsPage,
} from '@features/settings/pages';
import { AiAgentPage } from '@features/ai-agent';
import { useAuthStore } from '@auth/stores';
import { LoadingSpinner } from '@common/components';
import './App.css';


// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRoles?: string[] }> = ({
  children,
  requiredRoles
}) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements if specified
  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = user?.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Auth Layout Component
const AuthLayout: React.FC<{ children: React.ReactNode }> = () => {
  const [currentForm, setCurrentForm] = useState<'login' | 'register' | 'password-reset'>('login');

  const renderForm = () => {
    switch (currentForm) {
      case 'login':
        return (
          <LoginForm
            onSuccess={() => window.location.href = '/dashboard'}
            onSwitchToRegister={() => setCurrentForm('register')}
            onSwitchToPasswordReset={() => setCurrentForm('password-reset')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onSuccess={() => setCurrentForm('login')}
            onSwitchToLogin={() => setCurrentForm('login')}
          />
        );
      case 'password-reset':
        return (
          <PasswordResetForm
            onSuccess={() => setCurrentForm('login')}
            onSwitchToLogin={() => setCurrentForm('login')}
          />
        );
      default:
        return <LoginForm />;
    }
  };

  return (
    <div className="bg-gray-50">
      {renderForm()}
    </div>
  );
};

// Main App Routes
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <AuthLayout>
            <LoginForm />
          </AuthLayout>
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <AuthLayout>
            <RegisterForm />
          </AuthLayout>
        </PublicRoute>
      } />
      <Route path="/password-reset" element={
        <PublicRoute>
          <AuthLayout>
            <PasswordResetForm />
          </AuthLayout>
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* User Management Routes */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRoles={['admin', 'super-admin']}>
            <MainLayout>
              <UserManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute requiredRoles={['admin', 'super-admin']}>
            <MainLayout>
              <RoleManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/permissions"
        element={
          <ProtectedRoute requiredRoles={['admin', 'super-admin']}>
            <MainLayout>
              <PermissionMatrix />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <UserProfile />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Inventory Management Routes */}
      <Route path="/inventory" element={
        <ProtectedRoute>
          <MainLayout>
            <ProductsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/inventory/stock" element={
        <ProtectedRoute>
          <MainLayout>
            <StockPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/inventory/batches" element={
        <ProtectedRoute>
          <MainLayout>
            <BatchesPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/inventory/movements" element={
        <ProtectedRoute>
          <MainLayout>
            <MovementsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/inventory/reports" element={
        <ProtectedRoute>
          <MainLayout>
            <ReportsPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/sales" element={
        <ProtectedRoute>
          <MainLayout>
            <SalesPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/sales/invoices" element={
        <ProtectedRoute>
          <MainLayout>
            <InvoiceManagementPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/sales/payments" element={
        <ProtectedRoute>
          <MainLayout>
            <PaymentManagementPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/sales/reports" element={
        <ProtectedRoute>
          <MainLayout>
            <SalesReportsPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Purchasing Management Routes */}
      <Route path="/purchasing" element={
        <ProtectedRoute>
          <MainLayout>
            <PurchasingPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/purchasing/orders" element={
        <ProtectedRoute>
          <MainLayout>
            <PurchaseManagementPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/purchasing/suppliers" element={
        <ProtectedRoute>
          <MainLayout>
            <SupplierManagementPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/purchasing/reports" element={
        <ProtectedRoute>
          <MainLayout>
            <PurchasingReportsPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/accounting" element={
        <ProtectedRoute>
          <MainLayout>
            <AccountingPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/accounting/accounts" element={
        <ProtectedRoute>
          <MainLayout>
            <AccountManagementPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/accounting/journal-entries" element={
        <ProtectedRoute>
          <MainLayout>
            <JournalEntryManagementPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/accounting/reports" element={
        <ProtectedRoute>
          <MainLayout>
            <AccountingFinancialReportsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/accounting/reconciliation" element={
        <ProtectedRoute>
          <MainLayout>
            <AccountReconciliationPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/clients" element={
        <ProtectedRoute>
          <MainLayout>
            <ClientsPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute>
          <MainLayout>
            <GeneralReportsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/reports/financial" element={
        <ProtectedRoute>
          <MainLayout>
            <FinancialReportsPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/ai-agent" element={
        <ProtectedRoute>
          <MainLayout>
            <AiAgentPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <SettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings/basic" element={
        <ProtectedRoute>
          <MainLayout>
            <BasicSettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings/company" element={
        <ProtectedRoute>
          <MainLayout>
            <CompanySettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings/invoice" element={
        <ProtectedRoute>
          <MainLayout>
            <InvoiceSettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings/datetime" element={
        <ProtectedRoute>
          <MainLayout>
            <DateTimeSettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings/inventory" element={
        <ProtectedRoute>
          <MainLayout>
            <InventorySettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings/email" element={
        <ProtectedRoute>
          <MainLayout>
            <EmailSettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings/print" element={
        <ProtectedRoute>
          <MainLayout>
            <PrintSettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings/number-format" element={
        <ProtectedRoute>
          <MainLayout>
            <NumberFormatSettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings/security" element={
        <ProtectedRoute>
          <MainLayout>
            <SecuritySettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings/notifications" element={
        <ProtectedRoute>
          <MainLayout>
            <NotificationSettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings/backup" element={
        <ProtectedRoute>
          <MainLayout>
            <BackupSettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings/business-hours" element={
        <ProtectedRoute>
          <MainLayout>
            <BusinessHoursSettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Catch all route - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AppProviders>
      <Router>
        <AppRoutes />
      </Router>
    </AppProviders>
  );
};

export default App;
