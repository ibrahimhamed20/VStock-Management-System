import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from '@common/providers';
import { MainLayout } from '@core/layout';
import { LoginForm, RegisterForm, PasswordResetForm } from '@auth/components';
import { UserManagement, RoleManagement, PermissionManagement, UserProfile } from '@features/users';
import { Dashboard } from '@features/dashboard';
import { useAuthStore } from '@auth/stores';
import { LoadingSpinner } from '@common/components';

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
              <PermissionManagement />
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

      {/* Business Module Routes */}
      <Route path="/inventory" element={
        <ProtectedRoute>
          <MainLayout>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
              <p className="text-gray-600">Inventory management functionality coming soon...</p>
            </div>
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/sales" element={
        <ProtectedRoute>
          <MainLayout>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Sales Management</h1>
              <p className="text-gray-600">Sales management functionality coming soon...</p>
            </div>
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/purchasing" element={
        <ProtectedRoute>
          <MainLayout>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Purchasing Management</h1>
              <p className="text-gray-600">Purchasing management functionality coming soon...</p>
            </div>
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/accounting" element={
        <ProtectedRoute>
          <MainLayout>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Accounting</h1>
              <p className="text-gray-600">Accounting functionality coming soon...</p>
            </div>
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute>
          <MainLayout>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Reports</h1>
              <p className="text-gray-600">Reports functionality coming soon...</p>
            </div>
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/ai-agent" element={
        <ProtectedRoute>
          <MainLayout>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">AI Agent</h1>
              <p className="text-gray-600">AI Agent functionality coming soon...</p>
            </div>
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Settings</h1>
              <p className="text-gray-600">Settings functionality coming soon...</p>
            </div>
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
