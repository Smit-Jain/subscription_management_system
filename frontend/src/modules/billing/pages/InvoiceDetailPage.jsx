import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Send, CheckCircle, X as CancelIcon } from 'lucide-react';
import { StatusStepper } from '../../../components/ui/StatusStepper';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/Badge';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { getInvoice, confirmInvoice, cancelInvoice, sendInvoice } from '../services/billing.service';
import { formatDate, formatCurrency } from '../../../utils/index';
import { useToast } from '../../../context/ToastContext';

const INV_STEPS = [
  { key: 'draft',     label: 'Draft' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'paid',      label: 'Paid' },
];

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [invoice, setInvoice] = useState(null);
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getInvoice(id).then(setInvoice);
  }, [id]);

  if (!invoice) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-6 h-6 border-2 border-forest border-t-transparent rounded-full" />
    </div>
  );

  const doConfirm = async () => {
    setLoading(true);
    try {
      await confirmInvoice(id);
      setInvoice((i) => ({ ...i, status: 'confirmed' }));
      toast.success('Invoice confirmed.');
    } catch (err) {
      toast.error(err.message || 'Failed to confirm invoice.');
    } finally {
      setLoading(false); setAction(null);
    }
  };

  const doCancel = async () => {
    setLoading(true);
    try {
      await cancelInvoice(id);
      setInvoice((i) => ({ ...i, status: 'cancelled' }));
      toast.success('Invoice cancelled.');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel invoice.');
    } finally {
      setLoading(false); setAction(null);
    }
  };

  const doSend = async () => {
    setSending(true);
    try {
      await sendInvoice(id);
      toast.success('Invoice sent via email!');
    } catch (err) {
      toast.error(err.message || 'Failed to send invoice email.');
    } finally {
      setSending(false);
    }
  };

  const stepStatus = ['cancelled', 'paid', 'confirmed', 'draft'].includes(invoice.status) ? invoice.status : 'draft';

  return (
    <div className="space-y-5 max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors">
        <ArrowLeft size={16} /> Back to Invoices
      </button>

      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="font-heading font-bold text-2xl text-ink">{invoice.number}</h1>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === 'draft' && (
            <Button variant="primary" icon={CheckCircle} onClick={() => setAction('confirm')}>Confirm</Button>
          )}
          {['draft', 'confirmed'].includes(invoice.status) && (
            <Button variant="danger" icon={CancelIcon} onClick={() => setAction('cancel')}>Cancel</Button>
          )}
          <Button variant="ghost" icon={Send} loading={sending} onClick={doSend}>Send</Button>
          <Button variant="ghost" icon={Printer} onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      {/* Status stepper */}
      <div className="bg-cream rounded-2xl border border-border p-4">
        <StatusStepper steps={INV_STEPS} currentStep={stepStatus === 'cancelled' ? 'draft' : stepStatus} />
      </div>

      {/* Invoice document */}
      <div className="bg-paper rounded-2xl border border-border p-8 print:shadow-none" id="invoice-print">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#0E5A55"/>
                <path d="M16 8C11.6 8 8 11.6 8 16s3.6 8 8 8c2.4 0 4.5-1 6-2.6" stroke="#DDF0EA" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M20 5.5l3 3-3 3" stroke="#F6B73C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-heading font-bold text-xl text-ink">Brightloop Software</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              123 Tech Park, Koramangala<br />
              Bengaluru, Karnataka 560034<br />
              GST: 29AAXCB1234C1Z5<br />
              billing@brightloop.io
            </p>
          </div>
          <div className="text-right">
            <p className="font-heading font-extrabold text-4xl text-ink-soft/30 mb-2">INVOICE</p>
            <p className="text-sm font-semibold text-ink">{invoice.number}</p>
            <p className="text-xs text-ink-soft mt-1">Issue Date: {formatDate(invoice.issueDate)}</p>
            <p className="text-xs text-ink-soft">Due Date: <span className={invoice.status === 'overdue' ? 'text-coral font-semibold' : ''}>{formatDate(invoice.dueDate)}</span></p>
          </div>
        </div>

        {/* Bill to */}
        <div className="mb-8 p-4 bg-cream rounded-xl border border-border">
          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">Bill To</p>
          <p className="font-semibold text-ink">{invoice.customerName}</p>
          <p className="text-xs text-ink-soft mt-0.5">Invoice linked to Subscription #{invoice.subscriptionId}</p>
        </div>

        {/* Line items */}
        <div className="mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                {['Description', 'Qty', 'Unit Price', 'Tax', 'Amount'].map((h) => (
                  <th key={h} className="px-0 py-2 text-left text-xs font-bold text-ink-soft uppercase tracking-wide last:text-right">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(invoice.lines?.length ? invoice.lines : [
                { product: 'Subscription Services', qty: 1, unitPrice: invoice.subtotal, tax: '18%', amount: invoice.subtotal },
              ]).map((line, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="py-3 font-medium text-ink">{line.product}</td>
                  <td className="py-3 text-ink-soft text-center">{line.qty}</td>
                  <td className="py-3 text-ink-soft">{formatCurrency(line.unitPrice)}</td>
                  <td className="py-3 text-ink-soft">{typeof line.tax === 'number' ? `${line.tax}%` : line.tax}</td>
                  <td className="py-3 font-semibold text-ink text-right">{formatCurrency(line.amount || line.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-56 space-y-2 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-mint">
                <span>Discount</span>
                <span>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-soft">
              <span>Tax</span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-ink text-base border-t-2 border-ink pt-2">
              <span>Total</span>
              <span className="text-forest">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 pt-5 border-t border-border text-xs text-ink-soft">
          <p>Thank you for your business. Please make payment within {formatDate(invoice.dueDate)}.</p>
          <p className="mt-1">Bank: HDFC Bank · A/C: 5020001234567 · IFSC: HDFC0001234</p>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={action === 'confirm'} onClose={() => setAction(null)} onConfirm={doConfirm}
        title="Confirm Invoice" message="Mark this invoice as Confirmed?" confirmLabel="Confirm" variant="primary" loading={loading}
      />
      <ConfirmDialog
        open={action === 'cancel'}  onClose={() => setAction(null)} onConfirm={doCancel}
        title="Cancel Invoice" message="Are you sure you want to cancel this invoice? This cannot be undone." confirmLabel="Cancel Invoice" loading={loading}
      />
    </div>
  );
}
