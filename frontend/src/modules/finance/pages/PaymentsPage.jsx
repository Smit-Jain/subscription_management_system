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
import { getPayments, recordPayment, getInvoicesForPayment } from '../services/finance.service';
import { mockInvoices } from '../../../mock/billing';
import { formatDate, formatCurrency } from '../../../utils/index';
import { useToast } from '../../../context/ToastContext';

const METHODS = ['Bank Transfer', 'UPI', 'Cheque', 'Credit Card', 'Cash'];
const BLANK = { invoiceId: '', method: 'Bank Transfer', amount: '', date: new Date().toISOString().slice(0, 10), note: '' };

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [recordOpen, setRecordOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const loadData = () => {
    getPayments().then(setPayments);
    getInvoicesForPayment().then((list) => {
      setInvoices(list?.length ? list : mockInvoices);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Find currently selected invoice for remaining balance validation
  const selectedInvoice = invoices.find((i) => i.id === form.invoiceId);
  const remainingDue = selectedInvoice
    ? (selectedInvoice.remainingBalance !== undefined ? selectedInvoice.remainingBalance : (selectedInvoice.total - (selectedInvoice.amountPaid || 0)))
    : 0;

  const handleRecord = async (e) => {
    e.preventDefault();
    const payAmount = parseFloat(form.amount);

    if (!form.invoiceId) {
      toast.error('Please select an invoice.');
      return;
    }

    if (!payAmount || payAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0.');
      return;
    }

    if (remainingDue > 0 && payAmount > remainingDue + 0.01) {
      toast.error(`Amount cannot exceed the remaining balance of ${formatCurrency(remainingDue)}.`);
      return;
    }

    setLoading(true);
    try {
      const inv = selectedInvoice;
      const newPay = await recordPayment({
        ...form,
        amount: payAmount,
        invoiceNumber: inv?.number || '',
        customerName:  inv?.customerName || '',
        customerId:    inv?.customerId || '',
        status:        'completed',
      });

      setPayments((prev) => [newPay, ...prev]);
      toast.success('Payment recorded successfully.');
      setRecordOpen(false);
      setForm(BLANK);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to record payment.');
    } finally {
      setLoading(false);
    }
  };

  const totalCollected = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending   = payments.filter((p) => p.status === 'pending').length;

  const payableInvoices = invoices.filter((i) =>
    ['pending', 'overdue', 'confirmed', 'CONFIRMED'].includes(i.status) &&
    (i.remainingBalance === undefined || i.remainingBalance > 0)
  );

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
            <select
              className="w-full bg-cream border border-border rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest/40 transition-all"
              value={form.invoiceId}
              onChange={set('invoiceId')}
              required
            >
              <option value="">— Select invoice —</option>
              {payableInvoices.map((i) => {
                const bal = i.remainingBalance !== undefined ? i.remainingBalance : (i.total - (i.amountPaid || 0));
                return (
                  <option key={i.id} value={i.id}>
                    {i.number} — {i.customerName} ({formatCurrency(i.total)} · Bal: {formatCurrency(bal)})
                  </option>
                );
              })}
            </select>
            {selectedInvoice && (
              <p className="text-xs text-ink-soft">
                Outstanding Balance: <span className="font-semibold text-coral">{formatCurrency(remainingDue)}</span>
              </p>
            )}
          </div>
          <Select label="Payment Method" value={form.method} onChange={set('method')}>
            {METHODS.map((m) => <option key={m}>{m}</option>)}
          </Select>
          <Input
            label="Amount (₹)"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={set('amount')}
            required
          />
          <Input label="Payment Date" type="date" value={form.date} onChange={set('date')} required />
          <Input label="Note (optional)" placeholder="Reference number or remarks" value={form.note} onChange={set('note')} />
        </form>
      </Modal>
    </div>
  );
}
