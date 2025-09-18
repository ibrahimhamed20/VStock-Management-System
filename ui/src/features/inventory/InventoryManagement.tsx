import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Legacy InventoryManagement component - now redirects to ProductsPage
 * This component is kept for backward compatibility but redirects to the new page structure
 */
export const InventoryManagement: React.FC = () => {
  return <Navigate to="/inventory" replace />;
};
