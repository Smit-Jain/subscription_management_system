import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Building, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { DataTable } from '../../../components/ui/DataTable';
import { getCustomer } from '../services/catalog.service';
import { mockSubscriptions } from '../../../mock/subscriptions';
import { mockInvoices } from '../../../mock/billing';
import { formatDate, formatCurrency } from '../../../utils/index';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    // TODO(B): Replace with real API
    getCustomer(id).then(setCustomer);
  }, [id]);

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-forest border-t-transparent rounded-full" />
      </div>
    );
  }

  const subs = mockSubscriptions.filter((s) => s.customerId === id);
  const invs = mockInvoices.filter((i) => i.customerId === id);

  const subColumns = [
    { key: 'id',     label: 'ID',     render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'plan',   label: 'Plan',   sortable: true },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'startDate', label: 'Start', render: (v) => formatDate(v) },
    { key: 'expiryDate', label: 'Expiry', render: (v) => formatDate(v) },
    { key: 'total', label: 'Total', render: (v) => <span className="font-semibold text-forest">{formatCurrency(v)}</span> },
  ];

  const invColumns = [
    { key: 'number', label: 'Invoice#', render: (v) => <span className="font-mono text-xs font-semibold">{v}</span> },
    { key: 'issueDate', label: 'Date',   render: (v) => formatDate(v) },
    { key: 'dueDate',   label: 'Due',    render: (v) => formatDate(v) },
    { key: 'status',    label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'total',     label: 'Total',  render: (v) => <span className="font-semibold">{formatCurrency(v)}</span> },
  ];

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors">
        <ArrowLeft size={16} /> Back to Customers
      </button>

      {/* Header card */}
      <div className="bg-paper rounded-2xl border border-border p-6">
        <div className="flex items-start gap-5 flex-wrap">
          <Avatar name={customer.name} size="xl" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-heading text-2xl font-bold text-ink">{customer.name}</h1>
                <p className="text-ink-soft text-sm flex items-center gap-1.5 mt-1">
                  <Building size={13} /> {customer.company}
                </p>
              </div>
              <StatusBadge status={customer.status} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              {[
                { icon: Mail,     val: customer.email },
                { icon: Phone,    val: customer.phone },
                { icon: MapPin,   val: customer.address },
                { icon: Calendar, val: `Joined ${formatDate(customer.joined)}` },
              ].map(({ icon: Icon, val }) => (
                <div key={val} className="flex items-start gap-2">
                  <Icon size={13} className="text-ink-soft mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-ink-soft">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Plan chip */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-ink-soft">Current Plan:</span>
        <span className="bg-forest-light text-forest px-4 py-1.5 rounded-full text-sm font-bold border border-mint/20">
          {customer.plan}
        </span>
        <span className="text-sm font-medium text-ink-soft">Payment Terms:</span>
        <span className="bg-cream text-ink-soft px-4 py-1.5 rounded-full text-sm font-medium border border-border">
          Net 30
        </span>
      </div>

      {/* Subscriptions */}
      <div className="bg-paper rounded-2xl border border-border p-5">
        <h2 className="font-heading font-semibold text-ink mb-4">Subscriptions ({subs.length})</h2>
        <DataTable columns={subColumns} data={subs} searchable={false} pageSize={5} />
      </div>

      {/* Invoices */}
      <div className="bg-paper rounded-2xl border border-border p-5">
        <h2 className="font-heading font-semibold text-ink mb-4">Invoices ({invs.length})</h2>
        <DataTable columns={invColumns} data={invs} searchable={false} pageSize={5} />
      </div>
    </div>
  );
}
