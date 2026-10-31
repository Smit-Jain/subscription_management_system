import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Pause, X as CloseIcon, Play } from 'lucide-react';
import { StatusBadge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import { getCustomerSubscriptions } from '../../services/finance.service';
import { mockCurrentCustomer } from '../../../../mock/users';
import { mockPlans } from '../../../../mock/products';
import { formatDate, formatCurrency } from '../../../../utils/index';
import { useToast } from '../../../../context/ToastContext';

export default function MySubscriptionsPage() {
  const [subs, setSubs] = useState([]);
  const [action, setAction] = useState(null); // { type, subId }
  const navigate = useNavigate();
  const toast = useToast();
  const customer = mockCurrentCustomer;

  useEffect(() => {
    // TODO(D): Replace with real API using customer auth token
    getCustomerSubscriptions(customer.id).then(setSubs);
  }, []);

  const getPlanConfig = (planName) => mockPlans.find((p) => p.name === planName) || {};

  const doAction = (type, subId) => {
    const statusMap = { Pause: 'paused', Resume: 'active', Renew: 'active', Close: 'closed' };
    const newStatus = statusMap[type];
    setSubs((prev) => prev.map((s) => s.id === subId ? { ...s, status: newStatus } : s));
    toast.success(`Subscription ${type.toLowerCase()}d successfully.`);
    setAction(null);
  };

  const BG_MAP = {
    Starter: 'from-sky/10 to-sky/5 border-sky/20',
    Growth: 'from-forest-light to-cream border-mint/30',
    Enterprise: 'from-lilac/30 to-cream border-lilac/40',
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Subscriptions" subtitle={`Welcome back, ${customer.name.split(' ')[0]}!`} />

      {subs.length === 0 ? (
        <div className="text-center py-20 text-ink-soft">No subscriptions found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subs.map((sub) => {
            const plan = getPlanConfig(sub.plan);
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
                    <p className="text-xs text-ink-soft font-mono mt-0.5">{sub.id}</p>
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
                    <p className="text-sm font-medium text-ink">{sub.paymentTerms}</p>
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
        onConfirm={() => doAction(action?.type, action?.subId)}
        title={`${action?.type} Subscription`}
        message={`Are you sure you want to ${action?.type?.toLowerCase()} this subscription?`}
        confirmLabel={action?.type}
        variant={action?.type === 'Close' ? 'danger' : 'primary'}
      />
    </div>
  );
}
