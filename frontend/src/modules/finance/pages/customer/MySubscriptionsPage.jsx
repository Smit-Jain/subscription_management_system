import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Pause, X as CloseIcon, Play } from 'lucide-react';
import { StatusBadge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import { getCustomerSubscriptions, performSubscriptionAction } from '../../services/finance.service';
import { formatDate, formatCurrency } from '../../../../utils/index';
import { useToast } from '../../../../context/ToastContext';
import { useAuth } from '../../../../context/RoleContext';

export default function MySubscriptionsPage() {
  const [subs, setSubs] = useState([]);
  const [action, setAction] = useState(null); // { type, subId }
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      getCustomerSubscriptions(user.id).then(setSubs);
    } else {
      getCustomerSubscriptions().then(setSubs);
    }
  }, [user?.id]);

  const doAction = async (type, subId) => {
    const statusMap = { Pause: 'paused', Resume: 'active', Renew: 'active', Close: 'closed' };
    try {
      await performSubscriptionAction(subId, type);
      setSubs((prev) => prev.map((s) => s.id === subId ? { ...s, status: statusMap[type] } : s));
      toast.success(`Subscription ${type.toLowerCase()}d successfully.`);
    } catch (err) {
      toast.error(err.message || `Failed to ${type.toLowerCase()} subscription.`);
    }
    setAction(null);
  };

  const BG_MAP = {
    Starter: 'from-sky/10 to-sky/5 border-sky/20',
    Growth: 'from-forest-light to-cream border-mint/30',
    Enterprise: 'from-lilac/30 to-cream border-lilac/40',
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Subscriptions" subtitle={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}!`} />

      {subs.length === 0 ? (
        <div className="bg-paper rounded-2xl border border-border p-12 text-center text-ink-soft">
          <p className="font-medium text-ink">No subscriptions found.</p>
          <p className="text-xs text-ink-soft mt-1">Explore our product catalog and plans to subscribe.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subs.map((sub) => {
            const plan = sub.planConfig || { renewable: true, pausable: true, closableEarly: true };
            const gradCls = BG_MAP[sub.plan] || 'from-cream to-paper border-border';
            const isActive = sub.status === 'active';
            const isPaused = sub.status === 'paused';

            return (
              <div
                key={sub.id}
                className={`bg-gradient-to-br ${gradCls} rounded-2xl border p-5 cursor-pointer hover:shadow-warm-md transition-all`}
                onClick={() => navigate(`/customer/subscriptions/${sub.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-heading font-bold text-xl text-ink">{sub.plan} Plan</p>
                    <p className="text-xs text-ink-soft font-mono mt-0.5">{sub.number || sub.id}</p>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
                  <div>
                    <p className="text-xs text-ink-soft">Start Date</p>
                    <p className="text-sm font-medium text-ink">{formatDate(sub.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-soft">Expiry Date</p>
                    <p className="text-sm font-medium text-ink">{formatDate(sub.expiryDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-soft">Total Value</p>
                    <p className="text-sm font-semibold text-forest">{formatCurrency(sub.total)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-soft">Payment Terms</p>
                    <p className="text-sm font-medium text-ink">{sub.paymentTerms || 'Net 30'}</p>
                  </div>
                </div>

                {/* Allowed actions based on plan config */}
                <div className="flex gap-2 pt-3 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                  {plan.renewable && isActive && (
                    <Button size="sm" variant="ghost" icon={RefreshCw} onClick={() => setAction({ type: 'Renew', subId: sub.id })}>Renew</Button>
                  )}
                  {plan.pausable && isActive && (
                    <Button size="sm" variant="ghost" icon={Pause} onClick={() => setAction({ type: 'Pause', subId: sub.id })}>Pause</Button>
                  )}
                  {plan.pausable && isPaused && (
                    <Button size="sm" variant="ghost" icon={Play} onClick={() => setAction({ type: 'Resume', subId: sub.id })}>Resume</Button>
                  )}
                  {plan.closableEarly && (isActive || isPaused) && (
                    <Button size="sm" variant="danger" icon={CloseIcon} onClick={() => setAction({ type: 'Close', subId: sub.id })}>Close</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!action}
        onClose={() => setAction(null)}
        onConfirm={() => doAction(action.type, action.subId)}
        title={`${action?.type} Subscription`}
        message={`Are you sure you want to ${action?.type.toLowerCase()} this subscription?`}
        confirmLabel={action?.type}
        variant={action?.type === 'Close' ? 'danger' : 'primary'}
      />
    </div>
  );
}
