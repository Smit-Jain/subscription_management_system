// Root route combiner — one import line per module
import { publicRoutes, authAdminRoutes } from '../modules/auth/auth.routes';
import { catalogRoutes }                  from '../modules/catalog/catalog.routes';
import { billingRoutes }                  from '../modules/billing/billing.routes';
import { financeAdminRoutes, customerRoutes } from '../modules/finance/finance.routes';

import PublicLayout   from '../layouts/PublicLayout';
import AdminLayout    from '../layouts/AdminLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import PrivateRoute   from '../components/PrivateRoute';
import { Navigate }   from 'react-router-dom';

export const routes = [
  // Public (landing, login, signup, etc.)
  {
    path: '/',
    element: <PublicLayout />,
    children: publicRoutes,
  },

  // Admin + Staff portal — requires login
  {
    path: '/admin',
    element: (
      <PrivateRoute allowedRoles={['admin', 'staff']}>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      ...financeAdminRoutes,
      ...catalogRoutes,
      ...billingRoutes,
      ...authAdminRoutes,
    ],
  },

  // Customer portal — requires login
  {
    path: '/customer',
    element: (
      <PrivateRoute allowedRoles={['customer']}>
        <CustomerLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/customer/subscriptions" replace /> },
      ...customerRoutes,
    ],
  },

  // Fallback
  { path: '*', element: <Navigate to="/" replace /> },
];
