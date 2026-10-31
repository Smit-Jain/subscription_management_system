import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/Badge';
import { FilterBar } from '../../../components/ui/FilterBar';
import { Avatar } from '../../../components/ui/Avatar';
import { getSubscriptions } from '../services/catalog.service';
import { formatDate, formatCurrency } from '../../../utils/index';

const STATUS_OPTIONS = [
  { value: 'draft',     label: 'Draft' },
  { value: 'quotation', label: 'Quotation' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'active',    label: 'Active' },
  { value: 'paused',    label: 'Paused' },
  { value: 'closed',    label: 'Closed' },
  { value: 'overdue',   label: 'Overdue' },
];

const PLAN_OPTIONS = ['Starter', 'Growth', 'Enterprise', 'Annual Starter', 'Annual Growth', 'Weekly Dev'].map(
  (v) => ({ value: v, label: v })
);

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filters, setFilters] = useState({ status: '', plan: '', customer: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getSubscriptions()
      .then(setSubscriptions)
      .catch(() => setError('Failed to load subscriptions.'))
      .finally(() => setLoading(false));
  }, []);

  const handleFilterChange = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  const filtered = subscriptions.filter((s) => {
    if (filters.status && s.status !== filters.status) return false;
    if (filters.plan   && s.plan   !== filters.plan)   return false;
    if (filters.customer && !s.customerName.toLowerCase().includes(filters.customer.toLowerCase())) return false;
    return true;
  });

  const columns = [
    { key: 'id', label: 'ID', render: (v) => <span className="font-mono text-xs text-ink-soft">{v}</span> },
    {
      key: 'customerName', label: 'Customer', sortable: true,
      render: (v) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={v} size="sm" />
          <span className="font-medium text-sm text-ink">{v}</span>
        </div>
      ),
    },
    { key: 'plan',   label: 'Plan',   sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (v) => <StatusBadge status={v} /> },
    { key: 'startDate',  label: 'Start',  sortable: true, render: (v) => formatDate(v) },
    { key: 'expiryDate', label: 'Expiry', sortable: true, render: (v) => formatDate(v) },
    { key: 'total', label: 'Total',  sortable: true, render: (v) => <span className="font-semibold text-forest">{formatCurrency(v)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        subtitle={`${filtered.length} of ${subscriptions.length} subscriptions`}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => navigate('/admin/subscriptions/new')}>
            New Subscription
          </Button>
        }
      />

      <div className="mb-4">
        <FilterBar
          filters={[
            { key: 'status',   type: 'select', label: 'Status',   value: filters.status,   options: STATUS_OPTIONS },
            { key: 'plan',     type: 'select', label: 'Plan',     value: filters.plan,     options: PLAN_OPTIONS },
            { key: 'customer', type: 'text',   placeholder: 'Search customer…', value: filters.customer },
          ]}
          onFilterChange={handleFilterChange}
          onReset={() => setFilters({ status: '', plan: '', customer: '' })}
        />
      </div>

      <div className="bg-paper rounded-2xl border border-border p-5">
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(row) => navigate(`/admin/subscriptions/${row.id}`)}
          searchable={false}
        />
      </div>
    </div>
  );
}
