import DashboardPage   from './pages/DashboardPage';
import PaymentsPage    from './pages/PaymentsPage';
import OverduePage     from './pages/OverduePage';
import ReportsPage     from './pages/ReportsPage';

// Customer portal pages
import MySubscriptionsPage      from './pages/customer/MySubscriptionsPage';
import CustomerSubDetailPage    from './pages/customer/CustomerSubDetailPage';
import MyInvoicesPage           from './pages/customer/MyInvoicesPage';
import CustomerInvoiceDetailPage from './pages/customer/CustomerInvoiceDetailPage';
import MyPaymentsPage           from './pages/customer/MyPaymentsPage';
import ProfilePage              from './pages/customer/ProfilePage';

export const financeAdminRoutes = [
  { path: 'dashboard', element: <DashboardPage /> },
  { path: 'payments',  element: <PaymentsPage /> },
  { path: 'overdue',   element: <OverduePage /> },
  { path: 'reports',   element: <ReportsPage /> },
];

export const customerRoutes = [
  { path: 'subscriptions',      element: <MySubscriptionsPage /> },
  { path: 'subscriptions/:id',  element: <CustomerSubDetailPage /> },
  { path: 'invoices',           element: <MyInvoicesPage /> },
  { path: 'invoices/:id',       element: <CustomerInvoiceDetailPage /> },
  { path: 'payments',           element: <MyPaymentsPage /> },
  { path: 'profile',            element: <ProfilePage /> },
];
