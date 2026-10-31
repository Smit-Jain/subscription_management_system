import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select } from '../../../components/ui/FormFields';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { getDiscounts, saveDiscount } from '../services/billing.service';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate } from '../../../utils/index';

const BLANK = { name: '', type: 'percentage', value: '', minPurchase: '', minQty: '', startDate: '', endDate: '', usageLimit: '', used: 0, appliesTo: 'All subscriptions' };

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // TODO(C): Replace with real API
    getDiscounts().then(setDiscounts);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    // TODO(C): Validate dates and value constraints
    setLoading(true);
    try {
      const saved = await saveDiscount(editItem);
      setDiscounts((prev) => {
        const idx = prev.findIndex((d) => d.id === saved.id);
        return idx >= 0 ? prev.map((d) => d.id === saved.id ? saved : d) : [saved, ...prev];
      });
      toast.success(editItem.id ? 'Discount updated.' : 'Discount created.');
      setEditItem(null);
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setEditItem((d) => ({ ...d, [k]: e.target.value }));

  const columns = [
    { key: 'name',  label: 'Discount Name', sortable: true, render: (v) => <span className="font-medium text-ink">{v}</span> },
    { key: 'type',  label: 'Type', render: (v) => <span className="capitalize text-xs font-semibold text-ink-soft">{v}</span> },
    { key: 'value', label: 'Value',
      render: (v, row) => <span className="font-semibold text-forest">{row.type === 'fixed' ? formatCurrency(v) : `${v}%`}</span> },
    { key: 'startDate', label: 'Valid From', render: (v) => formatDate(v) },
    { key: 'endDate',   label: 'Valid Until', render: (v) => v ? formatDate(v) : 'No end' },
    { key: 'usageLimit', label: 'Usage',
      render: (v, row) => {
        const pct = Math.round((row.used / v) * 100);
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 bg-border rounded-full h-1.5">
              <div className="bg-forest h-1.5 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <span className="text-xs text-ink-soft">{row.used}/{v}</span>
          </div>
        );
      },
    },
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
        title="Discounts"
        subtitle="Create and manage discount campaigns"
        breadcrumb="Admin only"
        actions={<Button variant="primary" icon={Plus} onClick={() => setEditItem({ ...BLANK })}>Add Discount</Button>}
      />

      <div className="bg-paper rounded-2xl border border-border p-5">
        <DataTable columns={columns} data={discounts} />
      </div>

      <Modal
        open={!!editItem} onClose={() => setEditItem(null)} title={editItem?.id ? 'Edit Discount' : 'Add Discount'} size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={loading}>Save Discount</Button>
          </>
        }
      >
        {editItem && (
          <div className="space-y-4">
            <Input label="Discount Name" placeholder="New Customer 10%" value={editItem.name} onChange={set('name')} required />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Discount Type" value={editItem.type} onChange={set('type')}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </Select>
              <Input label={editItem.type === 'fixed' ? 'Amount (₹)' : 'Percentage (%)'} type="number" min="0" placeholder={editItem.type === 'fixed' ? '5000' : '10'} value={editItem.value} onChange={set('value')} required />
              <Input label="Min Purchase (₹, optional)" type="number" min="0" value={editItem.minPurchase} onChange={set('minPurchase')} />
              <Input label="Min Quantity (optional)"    type="number" min="1" value={editItem.minQty}       onChange={set('minQty')} />
              <Input label="Start Date"  type="date" value={editItem.startDate} onChange={set('startDate')} />
              <Input label="End Date"    type="date" value={editItem.endDate}   onChange={set('endDate')} />
              <Input label="Usage Limit" type="number" min="1" value={editItem.usageLimit} onChange={set('usageLimit')} />
            </div>
            <Input label="Applies To" placeholder="All subscriptions" value={editItem.appliesTo} onChange={set('appliesTo')} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { setDiscounts((p) => p.filter((d) => d.id !== deleteId)); setDeleteId(null); toast.success('Discount deleted.'); }}
        title="Delete Discount" message="Are you sure you want to delete this discount campaign?"
      />
    </div>
  );
}
