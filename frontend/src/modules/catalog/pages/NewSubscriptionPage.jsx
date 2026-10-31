import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/FormFields';
import { getCustomers, getPlans, getTemplates, saveSubscription } from '../services/catalog.service';
import { mockProducts } from '../../../mock/products';
import { formatCurrency } from '../../../utils/index';
import { useToast } from '../../../context/ToastContext';

const BLANK = {
  customerId: '', plan: 'Growth', startDate: '', expiryDate: '',
  paymentTerms: 'Net 30', templateId: '',
  lines: [],
};

export default function NewSubscriptionPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO(B): Replace with real API
    Promise.all([getCustomers(), getPlans(), getTemplates()]).then(([c, p, t]) => {
      setCustomers(c); setPlans(p); setTemplates(t);
    });
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const applyTemplate = (templateId) => {
    if (!templateId) return;
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setForm((f) => ({
        ...f,
        templateId,
        plan: tpl.plan,
        lines: tpl.lines.map((l) => ({ ...l, tax: 18, amount: l.qty * l.unitPrice * 1.18 })),
      }));
    }
  };

  const addLine = () =>
    setForm((f) => ({
      ...f,
      lines: [...f.lines, { product: mockProducts[0].name, qty: 1, unitPrice: mockProducts[0].salesPrice, tax: 18, amount: mockProducts[0].salesPrice * 1.18 }],
    }));

  const setLine = (idx, key, val) =>
    setForm((f) => {
      const lines = [...f.lines];
      const updated = { ...lines[idx], [key]: key === 'qty' || key === 'unitPrice' || key === 'tax' ? parseFloat(val) || 0 : val };
      updated.amount = updated.qty * updated.unitPrice * (1 + updated.tax / 100);
      lines[idx] = updated;
      return { ...f, lines };
    });

  const removeLine = (idx) => setForm((f) => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));

  const subtotal = form.lines.reduce((s, l) => s + (l.qty * l.unitPrice), 0);
  const taxTotal = form.lines.reduce((s, l) => s + (l.qty * l.unitPrice * l.tax / 100), 0);
  const total    = subtotal + taxTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO(B): Validate dates, check customer credit, trigger invoice generation
    setLoading(true);
    try {
      const customer = customers.find((c) => c.id === form.customerId);
      await saveSubscription({ ...form, customerName: customer?.name || '', total, status: 'draft' });
      toast.success('Subscription created successfully.');
      navigate('/admin/subscriptions');
    } catch {
      toast.error('Failed to create subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors mb-4">
        <ArrowLeft size={16} /> Back to Subscriptions
      </button>

      <PageHeader title="New Subscription" subtitle="Create a new customer subscription" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Core details */}
        <div className="bg-paper rounded-2xl border border-border p-5">
          <h3 className="font-heading font-semibold text-ink mb-4">Subscription Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Customer" value={form.customerId} onChange={set('customerId')} required>
              <option value="">— Select customer —</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.company}</option>)}
            </Select>

            <Select label="Plan" value={form.plan} onChange={set('plan')}>
              {plans.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </Select>

            <Input label="Start Date" type="date" value={form.startDate} onChange={set('startDate')} required />
            <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={set('expiryDate')} />

            <Select label="Payment Terms" value={form.paymentTerms} onChange={set('paymentTerms')}>
              {['Net 15', 'Net 30', 'Net 45', 'Due on Receipt'].map((t) => <option key={t}>{t}</option>)}
            </Select>

            <Select
              label="Start from Template (optional)"
              value={form.templateId}
              onChange={(e) => { set('templateId')(e); applyTemplate(e.target.value); }}
            >
              <option value="">— No template —</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </div>
        </div>

        {/* Order lines */}
        <div className="bg-paper rounded-2xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-heading font-semibold text-ink">Order Lines</h3>
            <Button variant="ghost" size="sm" icon={Plus} onClick={addLine} type="button">Add Line</Button>
          </div>
          <div className="p-5 overflow-x-auto">
            {form.lines.length === 0 ? (
              <p className="text-center text-sm text-ink-soft py-8">No lines added. Click "Add Line" or select a template.</p>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {['Product', 'Qty', 'Unit Price (₹)', 'Tax %', 'Amount', ''].map((h) => (
                        <th key={h} className="px-2 py-2 text-left text-xs font-semibold text-ink-soft">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {form.lines.map((line, idx) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="px-2 py-2">
                          <select
                            className="bg-cream border border-border rounded-lg px-2 py-1.5 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-forest/30"
                            value={line.product}
                            onChange={(e) => {
                              const prod = mockProducts.find((p) => p.name === e.target.value);
                              setLine(idx, 'product', e.target.value);
                              if (prod) setLine(idx, 'unitPrice', prod.salesPrice);
                            }}
                          >
                            {mockProducts.map((p) => <option key={p.id}>{p.name}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <input type="number" min="1" value={line.qty} onChange={(e) => setLine(idx, 'qty', e.target.value)} className="bg-cream border border-border rounded-lg px-2 py-1.5 text-xs w-16 focus:outline-none focus:ring-1 focus:ring-forest/30" />
                        </td>
                        <td className="px-2 py-2">
                          <input type="number" min="0" value={line.unitPrice} onChange={(e) => setLine(idx, 'unitPrice', e.target.value)} className="bg-cream border border-border rounded-lg px-2 py-1.5 text-xs w-24 focus:outline-none focus:ring-1 focus:ring-forest/30" />
                        </td>
                        <td className="px-2 py-2">
                          <input type="number" min="0" max="100" value={line.tax} onChange={(e) => setLine(idx, 'tax', e.target.value)} className="bg-cream border border-border rounded-lg px-2 py-1.5 text-xs w-14 focus:outline-none focus:ring-1 focus:ring-forest/30" />
                        </td>
                        <td className="px-2 py-2 text-xs font-semibold text-forest">{formatCurrency(line.amount)}</td>
                        <td className="px-2 py-2">
                          <button type="button" onClick={() => removeLine(idx)} className="p-1 text-coral hover:bg-coral/5 rounded transition-colors"><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="mt-4 border-t border-border pt-4 flex justify-end">
                  <div className="w-56 space-y-1.5 text-sm">
                    <div className="flex justify-between text-ink-soft">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-ink-soft">
                      <span>Tax</span>
                      <span>{formatCurrency(taxTotal)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-ink border-t border-border pt-1.5">
                      <span>Total</span>
                      <span className="text-forest">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)} type="button">Cancel</Button>
          <Button variant="primary" type="submit" loading={loading}>Create Subscription</Button>
        </div>
      </form>
    </div>
  );
}
