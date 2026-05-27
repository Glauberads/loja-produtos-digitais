import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AnalyticsProvider } from './components/analytics/AnalyticsProvider';
import App from './App';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './components/admin/layout/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { ProductsPage } from './pages/admin/ProductsPage';
import { CouponsPage } from './pages/admin/CouponsPage';
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
import { SuccessPage } from './pages/SuccessPage';
import { MembersAreaPage } from './pages/MembersAreaPage';
import { DeliveryPage } from './pages/admin/DeliveryPage';
import { AffiliatesPage } from './pages/admin/AffiliatesPage';
import { CommissionsPage } from './pages/admin/CommissionsPage';
import { SuccessOfferPage } from './pages/SuccessOfferPage';
import { MemberAreaSettingsPage } from './pages/admin/MemberAreaSettingsPage';

const RootLayout = () => {
  return (
    <AnalyticsProvider>
      <Outlet />
    </AnalyticsProvider>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <App />,    
      },
      {
        path: '/success',
        element: <SuccessPage />,
      },
      {
        path: '/success-offer',
        element: <SuccessOfferPage />,
      },
      {
        path: '/minha-area',
        element: <MembersAreaPage />,
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
          { path: 'coupons', element: <CouponsPage /> },
          { path: 'marketing', element: <MarketingPage /> },
          { path: 'integrations', element: <IntegrationsPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'customers', element: <CustomersPage /> },
          { path: 'admins', element: <AdminsPage /> },
          { path: 'reviews', element: <ReviewsPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'ai-settings', element: <AiSettingsPage /> },
          { path: 'member-area', element: <MemberAreaSettingsPage /> },
          { path: 'leads', element: <LeadsPage /> },
          { path: 'logs', element: <LogsPage /> },
          { path: 'delivery', element: <DeliveryPage /> },
          { path: 'affiliates', element: <AffiliatesPage /> },
          { path: 'commissions', element: <CommissionsPage /> },
          { path: '*', element: <Navigate to="dashboard" replace /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ]
  }
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
