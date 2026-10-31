import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pause, RefreshCw, X as CloseIcon, CheckCircle, Play } from 'lucide-react';
import { StatusStepper } from '../../../components/ui/StatusStepper';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/Badge';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { getSubscription } from '../services/catalog.service';
import { formatDate, formatCurrency } from '../../../utils/index';
import { useToast } from '../../../context/ToastContext';

const SUB_STEPS = [
  { key: 'draft',     label: 'Draft' },
  { key: 'quotation', label: 'Quotation' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'active',    label: 'Active' },
  { key: 'closed',    label: 'Closed' },
];

const STATUS_FLOW = {
  draft:     { next: 'quotation',  action: 'Send Quotation', icon: CheckCircle },
  quotation: { next: 'confirmed',  action: 'Confirm',        icon: CheckCircle },
  confirmed: { next: 'active',     action: 'Activate',       icon: Play },
  active:    { next: 'closed',     action: 'Close',          icon: CloseIcon },
};

export default function SubscriptionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const toast = useToast();

  useEffect(() => {
    // TODO(B): Replace with real API
    getSubscription(id).then(setSub);
  }, [id]);

  if (!sub) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-6 h-6 border-2 border-forest border-t-transparent rounded-full" />
    </div>
  );

  const nextAction = STATUS_FLOW[sub.status];
  const isPaused = sub.status === 'paused';
  const isActive = sub.status === 'active';

  const doAction = (action) => {
    // TODO(B): Call real API to update status, trigger invoice generation on activation
    const nextStatus = {
      'Send Quotation': 'quotation',
      'Confirm': 'confirmed',
      'Activate': 'active',
      'Close': 'closed',
      'Pause': 'paused',
      'Renew': 'active',
      'Resume': 'active',
    }[action];

    if (nextStatus) {
      setSub((s) => ({ ...s, status: nextStatus }));
      toast.success(`Subscription ${action.toLowerCase()}d successfully.`);
    }
    setConfirmAction(null);
  };

  const currentStepKey = sub.status === 'overdue' ? 'active' : sub.status;

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors">
        <ArrowLeft size={16} /> Back to Subscriptions
      </button>

      {/* Header */}
      <div className="bg-paper rounded-2xl border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-heading text-2xl font-bold text-ink">{sub.id}</h1>
              <StatusBadge status={sub.status} />
            </div>
            <p className="text-sm text-ink-soft">{sub.customerName} · {sub.plan} Plan</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {nextAction && (
              <Button
                variant="primary"
                icon={nextAction.icon}
                onClick={() => setConfirmAction(nextAction.action)}
              >
                {nextAction.action}
              </Button>
            )}
            {isActive && (
              <Button variant="ghost" icon={Pause} onClick={() => setConfirmAction('Pause')}>
                Pause
              </Button>
            )}
            {isPaused && (
              <Button variant="ghost" icon={Play} onClick={() => setConfirmAction('Resume')}>
                Resume
              </Button>
            )}
            {(isActive || isPaused) && (
              <Button variant="ghost" icon={RefreshCw} onClick={() => setConfirmAction('Renew')}>
                Renew
              </Button>
            )}
          </div>
        </div>

        {/* Status stepper */}
        <div className="mt-6 bg-cream rounded-2xl border border-border p-4">
          <StatusStepper steps={SUB_STEPS} currentStep={currentStepKey} />
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Start Date',     value: formatDate(sub.startDate) },
          { label: 'Expiry Date',    value: formatDate(sub.expiryDate) },
          { label: 'Payment Terms',  value: sub.paymentTerms },
          { label: 'Total Value',    value: <span className="font-semibold text-forest">{formatCurrency(sub.total)}</span> },
          { label: 'Template',       value: sub.templateId || 'None' },
          { label: 'Plan',           value: sub.plan },
        ].map(({ label, value }) => (
          <div key={label} className="bg-paper rounded-xl border border-border p-4">
            <p className="text-xs text-ink-soft mb-1">{label}</p>
            <p className="text-sm font-medium text-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* Order lines */}
      {sub.lines?.length > 0 && (
        <div className="bg-paper rounded-2xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-heading font-semibold text-ink">Order Lines</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-cream">
                  {['Product', 'Qty', 'Unit Price', 'Tax %', 'Amount'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-ink-soft uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sub.lines.map((line, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">{line.product}</td>
                    <td className="px-4 py-3 text-ink-soft">{line.qty}</td>
                    <td className="px-4 py-3">{formatCurrency(line.unitPrice)}</td>
                    <td className="px-4 py-3 text-ink-soft">{line.tax}%</td>
                    <td className="px-4 py-3 font-semibold text-forest">{formatCurrency(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-cream">
                  <td colSpan={4} className="px-4 py-3 text-right font-semibold text-ink text-sm">Total</td>
                  <td className="px-4 py-3 font-bold text-forest">{formatCurrency(sub.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Confirm action dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => doAction(confirmAction)}
        title={`${confirmAction} Subscription?`}
        message={`Are you sure you want to ${confirmAction?.toLowerCase()} this subscription for ${sub.customerName}?`}
        confirmLabel={confirmAction}
        variant={confirmAction === 'Close' ? 'danger' : 'primary'}
      />
    </div>
  );
}
