import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select } from '../../../components/ui/FormFields';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { StatusBadge } from '../../../components/ui/Badge';
import { getTaxes, saveTax, deleteTax } from '../services/billing.service';
import { useToast } from '../../../context/ToastContext';

const BLANK = { name: '', percentage: '', appliesTo: 'All products', status: 'active' };

export default function TaxesPage() {
  const [taxes, setTaxes] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // TODO(C): Replace with real API
    getTaxes().then(setTaxes);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editItem.name?.trim()) {
      toast.error('Tax name is required.');
      return;
    }
    const pct = parseFloat(editItem.percentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error('Tax percentage must be between 0% and 100%.');
      return;
    }

    setLoading(true);
    try {
      const saved = await saveTax(editItem);
      setTaxes((prev) => {
        const idx = prev.findIndex((t) => t.id === saved.id);
        return idx >= 0 ? prev.map((t) => t.id === saved.id ? saved : t) : [saved, ...prev];
      });
      toast.success(editItem.id ? 'Tax updated.' : 'Tax created.');
      setEditItem(null);
    } catch (err) {
      toast.error(err.message || 'Failed to save tax.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    await deleteTax(deleteId);
    setTaxes((prev) => prev.filter((t) => t.id !== deleteId));
    toast.success('Tax deleted.');
    setDeleteId(null);
  };

  const columns = [
    { key: 'name',       label: 'Tax Name',   sortable: true, render: (v) => <span className="font-medium text-ink">{v}</span> },
    { key: 'percentage', label: 'Rate',        render: (v) => <span className="font-semibold text-forest">{v}%</span> },
    { key: 'appliesTo',  label: 'Applies To' },
    { key: 'status',     label: 'Status',     render: (v) => <StatusBadge status={v} /> },
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
        title="Taxes"
        subtitle="Configure GST, TDS, and other tax rates"
        breadcrumb="Admin only"
        actions={<Button variant="primary" icon={Plus} onClick={() => setEditItem({ ...BLANK })}>Add Tax</Button>}
      />

      <div className="bg-paper rounded-2xl border border-border p-5">
        <DataTable columns={columns} data={taxes} />
      </div>

      <Modal
        open={!!editItem} onClose={() => setEditItem(null)} title={editItem?.id ? 'Edit Tax' : 'Add Tax'} size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={loading}>Save Tax</Button>
          </>
        }
      >
        {editItem && (
          <div className="space-y-4">
            <Input label="Tax Name" placeholder="GST 18%" value={editItem.name} onChange={(e) => setEditItem((t) => ({ ...t, name: e.target.value }))} required />
            <Input label="Percentage (%)" type="number" min="0" max="100" placeholder="18" value={editItem.percentage} onChange={(e) => setEditItem((t) => ({ ...t, percentage: parseFloat(e.target.value) || 0 }))} required />
            <Input label="Applies To" placeholder="All products" value={editItem.appliesTo} onChange={(e) => setEditItem((t) => ({ ...t, appliesTo: e.target.value }))} />
            <Select label="Status" value={editItem.status} onChange={(e) => setEditItem((t) => ({ ...t, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Tax" message="Are you sure you want to delete this tax rate?"
      />
    </div>
  );
}
