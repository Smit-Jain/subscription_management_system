import { useState, useEffect } from 'react';
import { CreditCard, Plus } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select } from '../../../components/ui/FormFields';
import { StatusBadge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { StatCard } from '../../../components/ui/StatCard';
import { getPayments, recordPayment } from '../services/finance.service';
import { mockInvoices } from '../../../mock/billing';
import { formatDate, formatCurrency } from '../../../utils/index';
import { useToast } from '../../../context/ToastContext';

const METHODS = ['Bank Transfer', 'UPI', 'Cheque', 'Credit Card', 'Cash'];
const BLANK = { invoiceId: '', method: 'Bank Transfer', amount: '', date: '', note: '' };

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [recordOpen, setRecordOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // TODO(D): Replace with real API
    getPayments().then(setPayments);
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleRecord = async (e) => {
    e.preventDefault();
    // TODO(D): Validate amount <= outstanding balance for the invoice
    setLoading(true);
    try {
      const inv = mockInvoices.find((i) => i.id === form.invoiceId);
      const newPay = await recordPayment({
        ...form,
        amount: parseFloat(form.amount),
        invoiceNumber: inv?.number || '',
        customerName: inv?.customerName || '',
        customerId: inv?.customerId || '',
        status: 'completed',
      });
      setPayments((prev) => [newPay, ...prev]);
      toast.success('Payment recorded successfully.');
      setRecordOpen(false);
      setForm(BLANK);
    } catch {
      toast.error('Failed to record payment.');
    } finally {
      setLoading(false);
    }
  };

  const totalCollected = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending   = payments.filter((p) => p.status === 'pending').length;

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice', render: (v) => <span className="font-mono text-xs font-semibold">{v}</span> },
    {
      key: 'customerName', label: 'Customer', sortable: true,
      render: (v) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={v} size="sm" />
          <span className="text-sm font-medium">{v}</span>
        </div>
      ),
    },
    { key: 'amount',  label: 'Amount',  sortable: true, render: (v) => <span className="font-semibold text-forest">{v ? formatCurrency(v) : '—'}</span> },
    { key: 'method',  label: 'Method' },
    { key: 'date',    label: 'Date',    sortable: true, render: (v) => v ? formatDate(v) : '—' },
    { key: 'status',  label: 'Status',  render: (v) => <StatusBadge status={v} /> },
    { key: 'note',    label: 'Note',    render: (v) => <span className="text-xs text-ink-soft">{v || '—'}</span> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payments"
        subtitle="Track all payments received"
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setRecordOpen(true)}>
            Record Payment
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Collected" value={formatCurrency(totalCollected, { compact: true })} icon={CreditCard} bg="bg-forest-light" iconBg="bg-forest/10" iconColor="text-forest" />
        <StatCard title="Total Transactions" value={payments.filter((p) => p.status === 'completed').length} icon={CreditCard} bg="bg-lilac/30" iconBg="bg-violet-100" iconColor="text-violet-600" />
        <StatCard title="Pending Payments" value={totalPending} icon={CreditCard} bg="bg-marigold/10" iconBg="bg-marigold/20" iconColor="text-amber-700" />
      </div>

      <div className="bg-paper rounded-2xl border border-border p-5">
        <DataTable columns={columns} data={payments} />
      </div>

      {/* Record Payment Modal */}
      <Modal
        open={recordOpen} onClose={() => setRecordOpen(false)} title="Record Payment" size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRecordOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleRecord} loading={loading}>Record Payment</Button>
          </>
        }
      >
        <form onSubmit={handleRecord} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Invoice</label>
            <select className="w-full bg-cream border border-border rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest/40 transition-all" value={form.invoiceId} onChange={set('invoiceId')} required>
              <option value="">— Select invoice —</option>
              {mockInvoices.filter((i) => ['pending', 'overdue', 'confirmed'].includes(i.status)).map((i) => (
                <option key={i.id} value={i.id}>{i.number} — {i.customerName} ({formatCurrency(i.total)})</option>
              ))}
            </select>
          </div>
          <Select label="Payment Method" value={form.method} onChange={set('method')}>
            {METHODS.map((m) => <option key={m}>{m}</option>)}
          </Select>
          <Input label="Amount (₹)" type="number" min="0" placeholder="0.00" value={form.amount} onChange={set('amount')} required />
          <Input label="Payment Date" type="date" value={form.date} onChange={set('date')} required />
          <Input label="Note (optional)" placeholder="Reference number or remarks" value={form.note} onChange={set('note')} />
        </form>
      </Modal>
    </div>
  );
}
