// ============================================================
// MOCK DATA — Products & Plans
// TODO(B): Replace with real API calls from catalog service
// ============================================================

export const mockProducts = [
  { id: 'p1',  name: 'Odoo ERP Core',          type: 'Service',  salesPrice: 25000, costPrice: 8000,  notes: 'Full ERP suite with core modules',         variants: [{ attribute: 'Edition', value: 'Community', extraPrice: 0 }, { attribute: 'Edition', value: 'Enterprise', extraPrice: 15000 }] },
  { id: 'p2',  name: 'CRM Module',              type: 'Service',  salesPrice: 8000,  costPrice: 2500,  notes: 'Customer relationship management module',   variants: [] },
  { id: 'p3',  name: 'HR & Payroll Module',     type: 'Service',  salesPrice: 12000, costPrice: 4000,  notes: 'HR, attendance, payroll automation',        variants: [{ attribute: 'Seats', value: 'Up to 50', extraPrice: 0 }, { attribute: 'Seats', value: 'Up to 200', extraPrice: 4000 }] },
  { id: 'p4',  name: 'Inventory & WMS',         type: 'Service',  salesPrice: 10000, costPrice: 3000,  notes: 'Warehouse & inventory management',          variants: [] },
  { id: 'p5',  name: 'Accounting Module',       type: 'Service',  salesPrice: 9000,  costPrice: 3000,  notes: 'Full accounting, GST, TDS compliance',      variants: [{ attribute: 'Brand', value: 'Odoo', extraPrice: 0 }, { attribute: 'Brand', value: 'Zoho', extraPrice: 560 }] },
  { id: 'p6',  name: 'E-Commerce Module',       type: 'Service',  salesPrice: 7500,  costPrice: 2200,  notes: 'Online storefront integration',             variants: [] },
  { id: 'p7',  name: 'Project Management',      type: 'Service',  salesPrice: 6000,  costPrice: 1800,  notes: 'Task and project tracking',                variants: [] },
  { id: 'p8',  name: 'Manufacturing Module',    type: 'Service',  salesPrice: 14000, costPrice: 5000,  notes: 'Production, BOM, work orders',             variants: [] },
  { id: 'p9',  name: 'Email Marketing',         type: 'Service',  salesPrice: 4500,  costPrice: 1200,  notes: 'Bulk email campaigns and automation',       variants: [{ attribute: 'Contacts', value: '10K', extraPrice: 0 }, { attribute: 'Contacts', value: '50K', extraPrice: 2000 }] },
  { id: 'p10', name: 'Helpdesk & Tickets',      type: 'Service',  salesPrice: 5500,  costPrice: 1600,  notes: 'Customer support ticketing system',         variants: [] },
  { id: 'p11', name: 'Cloud Hosting - Basic',   type: 'Product',  salesPrice: 3000,  costPrice: 1200,  notes: '2vCPU, 4GB RAM, 50GB SSD',                 variants: [] },
  { id: 'p12', name: 'Cloud Hosting - Pro',     type: 'Product',  salesPrice: 8000,  costPrice: 3500,  notes: '4vCPU, 16GB RAM, 200GB SSD',               variants: [] },
  { id: 'p13', name: 'SSL Certificate',         type: 'Product',  salesPrice: 1200,  costPrice: 400,   notes: 'Annual wildcard SSL certificate',           variants: [] },
  { id: 'p14', name: 'Implementation Services', type: 'Service',  salesPrice: 35000, costPrice: 15000, notes: 'On-site setup and configuration',           variants: [{ attribute: 'Duration', value: '1 Week', extraPrice: 0 }, { attribute: 'Duration', value: '2 Weeks', extraPrice: 20000 }] },
  { id: 'p15', name: 'Training Package',        type: 'Service',  salesPrice: 18000, costPrice: 7000,  notes: '20 hrs of user and admin training',         variants: [] },
  { id: 'p16', name: 'Annual Support SLA',      type: 'Service',  salesPrice: 22000, costPrice: 8500,  notes: 'Priority support, 4-hr SLA',               variants: [{ attribute: 'Priority', value: 'Standard', extraPrice: 0 }, { attribute: 'Priority', value: 'Premium', extraPrice: 8000 }] },
  { id: 'p17', name: 'Custom Dev - 10hrs',      type: 'Service',  salesPrice: 15000, costPrice: 6000,  notes: 'Custom development hours block',            variants: [] },
  { id: 'p18', name: 'Data Migration',          type: 'Service',  salesPrice: 12000, costPrice: 5000,  notes: 'Legacy data import and cleanup',            variants: [] },
  { id: 'p19', name: 'Mobile App Access',       type: 'Service',  salesPrice: 3500,  costPrice: 1000,  notes: 'iOS & Android companion app licence',       variants: [] },
  { id: 'p20', name: 'API Integration Pack',    type: 'Service',  salesPrice: 9500,  costPrice: 3500,  notes: 'REST API access + 10 integration slots',   variants: [] },
  { id: 'p21', name: 'Backup & DR Service',     type: 'Product',  salesPrice: 5000,  costPrice: 2000,  notes: 'Daily offsite backup with disaster recovery',variants: [] },
];

export const mockPlans = [
  {
    id: 'pl1', name: 'Starter',    price: 9900,  billingPeriod: 'monthly',  minQty: 1,  color: 'sky',
    availableFrom: '2024-01-01', availableTo: null,
    autoClose: false, closableEarly: true,  pausable: true,  renewable: true,
    description: 'Perfect for small teams getting started with ERP.',
    features: ['Up to 5 users', 'CRM & Helpdesk', 'Email support', '5GB storage'],
  },
  {
    id: 'pl2', name: 'Growth',     price: 24900, billingPeriod: 'monthly',  minQty: 1,  color: 'forest',
    availableFrom: '2024-01-01', availableTo: null,
    autoClose: false, closableEarly: true,  pausable: true,  renewable: true,
    description: 'For growing businesses needing full ERP capability.',
    features: ['Up to 25 users', 'All Starter features', 'Accounting & HR', 'Priority support', '50GB storage'],
  },
  {
    id: 'pl3', name: 'Enterprise', price: 59900, billingPeriod: 'monthly',  minQty: 1,  color: 'lilac',
    availableFrom: '2024-01-01', availableTo: null,
    autoClose: false, closableEarly: true,  pausable: true,  renewable: true,
    description: 'Unlimited scale with dedicated infrastructure and SLA.',
    features: ['Unlimited users', 'All modules', 'Dedicated hosting', '4-hr SLA', 'Custom development hours', '500GB storage'],
  },
  {
    id: 'pl4', name: 'Annual Starter', price: 99000, billingPeriod: 'yearly', minQty: 1, color: 'marigold',
    availableFrom: '2024-01-01', availableTo: null,
    autoClose: true,  closableEarly: false, pausable: false, renewable: true,
    description: 'Starter plan billed annually — save 2 months.',
    features: ['Up to 5 users', 'CRM & Helpdesk', 'Email support', '5GB storage', '2 months free'],
  },
  {
    id: 'pl5', name: 'Annual Growth', price: 249000, billingPeriod: 'yearly', minQty: 1, color: 'mint',
    availableFrom: '2024-01-01', availableTo: null,
    autoClose: true,  closableEarly: false, pausable: false, renewable: true,
    description: 'Growth plan billed annually — best value.',
    features: ['Up to 25 users', 'All Growth features', '2 months free'],
  },
  {
    id: 'pl6', name: 'Weekly Dev',    price: 3500,  billingPeriod: 'weekly',   minQty: 1, color: 'coral',
    availableFrom: '2024-06-01', availableTo: '2025-12-31',
    autoClose: true,  closableEarly: true,  pausable: true,  renewable: true,
    description: 'Short-term subscription for sprint-based engagements.',
    features: ['1 active project', 'Dev environment', 'Slack support'],
  },
];

export const mockQuotationTemplates = [
  { id: 'qt1', name: 'Standard Starter Template',    plan: 'Starter',    validityDays: 30, lines: [{ product: 'Odoo ERP Core', qty: 1, unitPrice: 25000 }, { product: 'Cloud Hosting - Basic', qty: 1, unitPrice: 3000 }] },
  { id: 'qt2', name: 'Growth Bundle Template',       plan: 'Growth',     validityDays: 30, lines: [{ product: 'Odoo ERP Core', qty: 1, unitPrice: 25000 }, { product: 'CRM Module', qty: 1, unitPrice: 8000 }, { product: 'Cloud Hosting - Pro', qty: 1, unitPrice: 8000 }] },
  { id: 'qt3', name: 'Enterprise Full Stack',        plan: 'Enterprise', validityDays: 15, lines: [{ product: 'Odoo ERP Core', qty: 1, unitPrice: 25000 }, { product: 'Manufacturing Module', qty: 1, unitPrice: 14000 }, { product: 'Implementation Services', qty: 1, unitPrice: 35000 }, { product: 'Annual Support SLA', qty: 1, unitPrice: 22000 }] },
  { id: 'qt4', name: 'HR & Payroll Quick-Start',     plan: 'Starter',    validityDays: 14, lines: [{ product: 'HR & Payroll Module', qty: 1, unitPrice: 12000 }, { product: 'Training Package', qty: 1, unitPrice: 18000 }] },
  { id: 'qt5', name: 'E-Commerce Accelerator',       plan: 'Growth',     validityDays: 21, lines: [{ product: 'E-Commerce Module', qty: 1, unitPrice: 7500 }, { product: 'Email Marketing', qty: 1, unitPrice: 4500 }, { product: 'Cloud Hosting - Pro', qty: 1, unitPrice: 8000 }] },
];
