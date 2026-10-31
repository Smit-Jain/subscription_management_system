import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Pause, X as CloseIcon, Play } from 'lucide-react';
import { StatusStepper } from '../../../../components/ui/StatusStepper';
import { StatusBadge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import { getCustomerSubscription, getCustomerSubscriptions, performSubscriptionAction } from '../../services/finance.service';
import { formatDate, formatCurrency } from '../../../../utils/index';
import { useToast } from '../../../../context/ToastContext';
import { useAuth } from '../../../../context/RoleContext';

const SUB_STEPS = [
  { key: 'draft',     label: 'Draft' },
  { key: 'quotation', label: 'Quotation' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'active',    label: 'Active' },
  { key: 'closed',    label: 'Closed' },
];

export default function CustomerSubDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [sub, setSub] = useState(null);
  const [action, setAction] = useState(null);

  useEffect(() => {
    getCustomerSubscription(id).then((found) => {
      if (found) {
        setSub(found);
      } else if (user?.id) {
        getCustomerSubscriptions(user.id).then((list) => {
          setSub(list.find((s) => s.id === id) || null);
        });
      }
    });
  }, [id, user?.id]);

  if (!sub) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-6 h-6 border-2 border-forest border-t-transparent rounded-full" /></div>;

  const plan = sub.planConfig || { renewable: true, pausable: true, closableEarly: true };
  const isActive = sub.status === 'active';
  const isPaused = sub.status === 'paused';

  const doAction = async (type) => {
    const statusMap = { Pause: 'paused', Resume: 'active', Renew: 'active', Close: 'closed' };
    try {
      await performSubscriptionAction(sub.id, type);
      setSub((s) => ({ ...s, status: statusMap[type] }));
      toast.success(`Subscription ${type.toLowerCase()}d successfully.`);
    } catch (err) {
      toast.error(err.message || `Failed to ${type.toLowerCase()} subscription.`);
    }
    setAction(null);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors">
        <ArrowLeft size={16} /> Back to My Subscriptions
      </button>

      <div className="bg-paper rounded-2xl border border-border p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="font-heading text-2xl font-bold text-ink">{sub.plan} Plan</h1>
            <p className="text-xs font-mono text-ink-soft mt-1">{sub.id}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={sub.status} />
            {plan.renewable && isActive && <Button size="sm" variant="ghost" icon={RefreshCw} onClick={() => setAction('Renew')}>Renew</Button>}
            {plan.pausable && isActive   && <Button size="sm" variant="ghost" icon={Pause}     onClick={() => setAction('Pause')}>Pause</Button>}
            {plan.pausable && isPaused   && <Button size="sm" variant="ghost" icon={Play}      onClick={() => setAction('Resume')}>Resume</Button>}
            {plan.closableEarly && (isActive || isPaused) && <Button size="sm" variant="danger" icon={CloseIcon} onClick={() => setAction('Close')}>Close</Button>}
          </div>
        </div>

        <div className="bg-cream rounded-2xl border border-border p-4">
          <StatusStepper steps={SUB_STEPS} currentStep={sub.status === 'overdue' ? 'active' : sub.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Start Date',    value: formatDate(sub.startDate) },
          { label: 'Expiry Date',   value: formatDate(sub.expiryDate) },
          { label: 'Payment Terms', value: sub.paymentTerms },
          { label: 'Total Value',   value: <span className="text-forest font-bold">{formatCurrency(sub.total)}</span> },
          { label: 'Template',      value: sub.templateId || 'Standard' },
          { label: 'Plan',          value: sub.plan },
        ].map(({ label, value }) => (
          <div key={label} className="bg-paper rounded-xl border border-border p-4">
            <p className="text-xs text-ink-soft">{label}</p>
            <p className="text-sm font-medium text-ink mt-1">{value}</p>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!action} onClose={() => setAction(null)} onConfirm={() => doAction(action)}
        title={`${action} Subscription`}
        message={`Are you sure you want to ${action?.toLowerCase()} your subscription?`}
        confirmLabel={action} variant={action === 'Close' ? 'danger' : 'primary'}
      />
    </div>
  );
}
