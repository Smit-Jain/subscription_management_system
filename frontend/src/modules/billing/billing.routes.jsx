import TaxesPage         from './pages/TaxesPage';
import DiscountsPage      from './pages/DiscountsPage';
import InvoicesPage       from './pages/InvoicesPage';
import InvoiceDetailPage  from './pages/InvoiceDetailPage';

export const billingRoutes = [
  { path: 'taxes',           element: <TaxesPage /> },
  { path: 'discounts',       element: <DiscountsPage /> },
  { path: 'invoices',        element: <InvoicesPage /> },
  { path: 'invoices/:id',    element: <InvoiceDetailPage /> },
];
