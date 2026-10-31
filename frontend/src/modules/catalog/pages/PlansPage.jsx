import { useState, useEffect } from 'react';
import { Plus, Edit2, Check, X as XIcon, BookOpen } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select, Textarea } from '../../../components/ui/FormFields';
import { Toggle } from '../../../components/ui/Toggle';
import { getPlans, savePlan } from '../services/catalog.service';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../utils/index';

const PERIODS = ['daily', 'weekly', 'monthly', 'yearly'];
const BLANK = {
  name: '', price: '', billingPeriod: 'monthly', minQty: 1,
  availableFrom: '', availableTo: '', description: '',
  features: [''],
  autoClose: false, closableEarly: true, pausable: true, renewable: true,
};

const COLOR_MAP = { sky: 'bg-sky/10 border-sky/30 text-sky', forest: 'bg-forest-light border-mint/30 text-forest', lilac: 'bg-lilac/30 border-lilac text-violet-700', marigold: 'bg-marigold/10 border-marigold/30 text-amber-700', mint: 'bg-mint/10 border-mint text-mint', coral: 'bg-coral/10 border-coral/30 text-coral' };

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // TODO(B): Replace with real API
    getPlans().then(setPlans);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    // TODO(B): Validate that availableTo is after availableFrom
    setLoading(true);
    try {
      const saved = await savePlan(editItem);
      setPlans((prev) => {
        const idx = prev.findIndex((p) => p.id === saved.id);
        return idx >= 0 ? prev.map((p) => p.id === saved.id ? saved : p) : [saved, ...prev];
      });
      toast.success(editItem.id ? 'Plan updated.' : 'Plan created.');
      setEditItem(null);
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (v) => setEditItem((p) => ({ ...p, [k]: v }));
  const setField = (k) => (e) => setEditItem((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <PageHeader
        title="Plans"
        subtitle="Manage subscription plans"
        actions={<Button variant="primary" icon={Plus} onClick={() => setEditItem({ ...BLANK })}>Add Plan</Button>}
      />

      {/* Plan cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const colorCls = COLOR_MAP[plan.color] || COLOR_MAP.sky;
          return (
            <div key={plan.id} className="bg-paper rounded-2xl border border-border p-5 shadow-warm hover:shadow-warm-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${colorCls} mb-2`}>
                    {plan.billingPeriod.toUpperCase()}
                  </span>
                  <h3 className="font-heading font-bold text-xl text-ink">{plan.name}</h3>
                </div>
                <button
                  onClick={() => setEditItem({ ...plan })}
                  className="p-2 text-ink-soft hover:text-forest rounded-xl hover:bg-forest-light transition-all opacity-0 group-hover:opacity-100"
                >
                  <Edit2 size={15} />
                </button>
              </div>

              <p className="font-heading font-extrabold text-2xl text-ink mb-1">
                {formatCurrency(plan.price)}
                <span className="text-sm font-normal text-ink-soft">/{plan.billingPeriod.slice(0, 2)}</span>
              </p>

              <p className="text-xs text-ink-soft mb-4 leading-relaxed">{plan.description}</p>

              <ul className="space-y-1.5 mb-4">
                {plan.features?.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-ink-soft">
                    <Check size={12} className="text-mint flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-2 gap-1.5 border-t border-border pt-3 mt-3">
                {[
                  ['Auto-close', plan.autoClose],
                  ['Closable early', plan.closableEarly],
                  ['Pausable', plan.pausable],
                  ['Renewable', plan.renewable],
                ].map(([label, enabled]) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs">
                    {enabled
                      ? <Check size={11} className="text-mint" />
                      : <XIcon size={11} className="text-ink-soft/40" />
                    }
                    <span className={enabled ? 'text-ink-soft' : 'text-ink-soft/40'}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={!!editItem} onClose={() => setEditItem(null)} title={editItem?.id ? 'Edit Plan' : 'Add Plan'} size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={loading}>Save Plan</Button>
          </>
        }
      >
        {editItem && (
          <div className="space-y-4">
            <Input label="Plan Name" placeholder="Growth" value={editItem.name} onChange={setField('name')} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price (₹)" type="number" min="0" placeholder="24900" value={editItem.price} onChange={setField('price')} required />
              <Select label="Billing Period" value={editItem.billingPeriod} onChange={setField('billingPeriod')}>
                {PERIODS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </Select>
              <Input label="Minimum Quantity" type="number" min="1" value={editItem.minQty} onChange={setField('minQty')} />
              <div />
              <Input label="Available From" type="date" value={editItem.availableFrom} onChange={setField('availableFrom')} />
              <Input label="Available To (blank = no end)" type="date" value={editItem.availableTo} onChange={setField('availableTo')} />
            </div>
            <Textarea label="Description" placeholder="Describe this plan…" value={editItem.description} onChange={setField('description')} />

            <div className="border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-ink mb-2">Plan Settings</p>
              <Toggle label="Auto-close at end date" description="Automatically closes the subscription when the end date is reached." checked={editItem.autoClose} onChange={set('autoClose')} />
              <Toggle label="Closable early" description="Allow closing this subscription before the end date." checked={editItem.closableEarly} onChange={set('closableEarly')} />
              <Toggle label="Pausable" description="Allow pausing this subscription temporarily." checked={editItem.pausable} onChange={set('pausable')} />
              <Toggle label="Renewable" description="Allow renewing this subscription at expiry." checked={editItem.renewable} onChange={set('renewable')} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
