import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select } from '../../../components/ui/FormFields';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { getTemplates, saveTemplate, deleteTemplate, getPlans, getProducts } from '../services/catalog.service';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../utils/index';

const BLANK = { name: '', plan: 'Starter', validityDays: 30, lines: [] };

export default function QuotationTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([getTemplates(), getPlans(), getProducts()]).then(([t, p, pr]) => {
      setTemplates(t);
      setPlans(p);
      setProducts(pr);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Resolve plan name -> planId before saving
      const planObj = plans.find((p) => p.name === editItem.plan || p.id === editItem.planId);
      const payload = { ...editItem, planId: planObj?.id || editItem.planId || null };
      const saved = await saveTemplate(payload);
      setTemplates((prev) => {
        const idx = prev.findIndex((t) => t.id === saved.id);
        return idx >= 0 ? prev.map((t) => t.id === saved.id ? saved : t) : [saved, ...prev];
      });
      toast.success(editItem.id ? 'Template updated.' : 'Template created.');
      setEditItem(null);
    } catch (err) {
      toast.error(err.message || 'Failed to save template.');
    } finally {
      setLoading(false);
    }
  };

  const addLine = () => {
    const first = products[0];
    if (!first) return;
    setEditItem((p) => ({ ...p, lines: [...p.lines, { productId: first.id, product: first.name, qty: 1, unitPrice: first.salesPrice }] }));
  };

  const setLine = (idx, key, val) => setEditItem((p) => {
    const lines = [...p.lines];
    lines[idx] = { ...lines[idx], [key]: key === 'qty' || key === 'unitPrice' ? parseFloat(val) || 0 : val };
    return { ...p, lines };
  });

  const handleDelete = async () => {
    try {
      await deleteTemplate(deleteId);
      setTemplates((p) => p.filter((t) => t.id !== deleteId));
      toast.success('Template deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete template.');
    } finally {
      setDeleteId(null);
    }
  };

  const removeLine = (idx) => setEditItem((p) => ({ ...p, lines: p.lines.filter((_, i) => i !== idx) }));

  const lineTotal = (l) => (l.qty || 0) * (l.unitPrice || 0);
  const grandTotal = editItem?.lines?.reduce((s, l) => s + lineTotal(l), 0) || 0;

  const columns = [
    { key: 'name',  label: 'Template Name', sortable: true, render: (v) => <span className="font-medium text-ink">{v}</span> },
    { key: 'plan',  label: 'Plan', sortable: true },
    { key: 'lines', label: 'Lines', render: (v) => <span className="text-xs text-ink-soft">{v?.length || 0} line(s)</span> },
    { key: 'validityDays', label: 'Valid For', render: (v) => `${v} days` },
    { key: 'id', label: '',
      render: (v, row) => (
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); setEditItem({ ...row }); }} className="p-1.5 text-ink-soft hover:text-forest rounded-lg hover:bg-forest-light transition-colors"><Edit2 size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(v); }} className="p-1.5 text-ink-soft hover:text-coral rounded-lg hover:bg-coral/5 transition-colors"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quotation Templates"
        subtitle={`${templates.length} templates`}
        actions={<Button variant="primary" icon={Plus} onClick={() => setEditItem({ ...BLANK, lines: [] })}>Add Template</Button>}
      />

      <div className="bg-paper rounded-2xl border border-border p-5">
        <DataTable columns={columns} data={templates} />
      </div>

      {/* Modal */}
      <Modal
        open={!!editItem} onClose={() => setEditItem(null)} title={editItem?.id ? 'Edit Template' : 'New Template'} size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={loading}>Save Template</Button>
          </>
        }
      >
        {editItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Input label="Template Name" placeholder="Standard Growth Bundle" value={editItem.name} onChange={(e) => setEditItem((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <Input label="Validity (days)" type="number" min="1" value={editItem.validityDays} onChange={(e) => setEditItem((p) => ({ ...p, validityDays: parseInt(e.target.value) || 30 }))} />
            </div>
            <Select label="Plan" value={editItem.plan} onChange={(e) => setEditItem((p) => ({ ...p, plan: e.target.value }))}>
              {plans.map((pl) => <option key={pl.id} value={pl.name}>{pl.name}</option>)}
            </Select>

            {/* Product lines */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-ink">Product Lines</label>
                <Button variant="ghost" size="sm" icon={Plus} onClick={addLine} type="button">Add Line</Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {['Product', 'Qty', 'Unit Price', 'Amount', ''].map((h) => (
                        <th key={h} className="px-2 py-2 text-left text-xs font-semibold text-ink-soft">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {editItem.lines.map((line, idx) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="px-2 py-1.5">
                          <select
                            className="bg-cream border border-border rounded-lg px-2 py-1.5 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-forest/30"
                            value={line.productId}
                            onChange={(e) => {
                              const prod = products.find((p) => p.id === e.target.value);
                              if (!prod) return;
                              const idx2 = editItem.lines.findIndex((l) => l === line);
                              setLine(idx2, 'productId', prod.id);
                              setLine(idx2, 'product',   prod.name);
                              setLine(idx2, 'unitPrice', prod.salesPrice);
                            }}
                          >
                            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-1.5">
                          <input type="number" min="1" value={line.qty} onChange={(e) => setLine(idx, 'qty', e.target.value)} className="bg-cream border border-border rounded-lg px-2 py-1.5 text-xs w-16 focus:outline-none focus:ring-1 focus:ring-forest/30" />
                        </td>
                        <td className="px-2 py-1.5">
                          <input type="number" min="0" value={line.unitPrice} onChange={(e) => setLine(idx, 'unitPrice', e.target.value)} className="bg-cream border border-border rounded-lg px-2 py-1.5 text-xs w-24 focus:outline-none focus:ring-1 focus:ring-forest/30" />
                        </td>
                        <td className="px-2 py-1.5 text-xs font-semibold text-forest">{formatCurrency(lineTotal(line))}</td>
                        <td className="px-2 py-1.5">
                          <button type="button" onClick={() => removeLine(idx)} className="p-1 text-coral hover:bg-coral/5 rounded transition-colors"><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {editItem.lines.length > 0 && (
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="px-2 py-2 text-right text-xs font-semibold text-ink">Total</td>
                        <td className="px-2 py-2 text-sm font-bold text-forest">{formatCurrency(grandTotal)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Template" message="Are you sure you want to delete this quotation template?"
      />
    </div>
  );
}
