import CustomersPage          from './pages/CustomersPage';
import CustomerDetailPage      from './pages/CustomerDetailPage';
import ProductsPage            from './pages/ProductsPage';
import PlansPage               from './pages/PlansPage';
import QuotationTemplatesPage  from './pages/QuotationTemplatesPage';
import SubscriptionsPage       from './pages/SubscriptionsPage';
import SubscriptionDetailPage  from './pages/SubscriptionDetailPage';
import NewSubscriptionPage     from './pages/NewSubscriptionPage';

export const catalogRoutes = [
  { path: 'customers',                 element: <CustomersPage /> },
  { path: 'customers/:id',             element: <CustomerDetailPage /> },
  { path: 'products',                  element: <ProductsPage /> },
  { path: 'plans',                     element: <PlansPage /> },
  { path: 'templates',                 element: <QuotationTemplatesPage /> },
  { path: 'subscriptions',             element: <SubscriptionsPage /> },
  { path: 'subscriptions/new',         element: <NewSubscriptionPage /> },
  { path: 'subscriptions/:id',         element: <SubscriptionDetailPage /> },
];
