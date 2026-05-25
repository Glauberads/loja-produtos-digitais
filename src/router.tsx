import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './components/admin/layout/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { ProductsPage } from './pages/admin/ProductsPage';
import { MarketingPage } from './pages/admin/MarketingPage';
import { IntegrationsPage } from './pages/admin/IntegrationsPage';
import { OrdersPage } from './pages/admin/OrdersPage';
import { CustomersPage } from './pages/admin/CustomersPage';
import { ReviewsPage } from './pages/admin/ReviewsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { LogsPage } from './pages/admin/LogsPage';
import { AdminsPage } from './pages/admin/AdminsPage';
import { AiSettingsPage } from './pages/admin/AiSettingsPage';
import { LeadsPage } from './pages/admin/LeadsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,    
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,    
  },
  {
    path: '/admin',
    element: <AdminLayout />,    
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'marketing', element: <MarketingPage /> },
      { path: 'integrations', element: <IntegrationsPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'admins', element: <AdminsPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'ai-settings', element: <AiSettingsPage /> },
      { path: 'leads', element: <LeadsPage /> },
      { path: 'logs', element: <LogsPage /> },
      { path: '*', element: <Navigate to="dashboard" replace /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
