import { useState, useEffect } from 'react';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { DataTable } from '../../../../components/ui/DataTable';
import { StatusBadge } from '../../../../components/ui/Badge';
import { StatCard } from '../../../../components/ui/StatCard';
import { CreditCard } from 'lucide-react';
import { getCustomerPayments } from '../../services/finance.service';
import { mockCurrentCustomer } from '../../../../mock/users';
import { formatDate, formatCurrency } from '../../../../utils/index';
import { useAuth } from '../../../../context/RoleContext';

export default function MyPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const { user } = useAuth();
  const customer = user || mockCurrentCustomer;

  useEffect(() => {
    getCustomerPayments(customer.id).then(setPayments);
  }, [customer.id]);

  const total = payments.reduce((s, p) => s + (p.amount || 0), 0);

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice', render: (v) => <span className="font-mono text-xs font-semibold">{v}</span> },
    { key: 'amount',  label: 'Amount',  sortable: true, render: (v) => <span className="font-semibold text-forest">{formatCurrency(v)}</span> },
    { key: 'method',  label: 'Method' },
    { key: 'date',    label: 'Date',    sortable: true, render: (v) => formatDate(v) },
    { key: 'status',  label: 'Status',  render: (v) => <StatusBadge status={v} /> },
    { key: 'note',    label: 'Note',    render: (v) => <span className="text-xs text-ink-soft">{v || '—'}</span> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="My Payments" subtitle="History of all payments made" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Total Paid" value={formatCurrency(total, { compact: true })} icon={CreditCard} bg="bg-forest-light" iconBg="bg-forest/10" iconColor="text-forest" />
        <StatCard title="Transactions" value={payments.length} icon={CreditCard} bg="bg-lilac/30" iconBg="bg-violet-100" iconColor="text-violet-600" />
      </div>

      <div className="bg-paper rounded-2xl border border-border p-5">
        <DataTable columns={columns} data={payments} />
      </div>
    </div>
  );
}
