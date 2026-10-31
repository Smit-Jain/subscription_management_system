import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select, Textarea } from '../../../components/ui/FormFields';
import { EmptyState } from '../../../components/ui/EmptyState';
import { getProducts, saveProduct, deleteProduct } from '../services/catalog.service';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../utils/index';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

const BLANK = { name: '', type: 'Service', salesPrice: '', costPrice: '', notes: '', variants: [] };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const openAdd = () => setEditItem({ ...BLANK });
  const openEdit = (item) => setEditItem({ ...item });

  const handleSave = async (e) => {
    e.preventDefault();
    // Validate: salesPrice must be >= costPrice
    const sp = parseFloat(editItem.salesPrice) || 0;
    const cp = parseFloat(editItem.costPrice)  || 0;
    if (sp < cp) {
      toast.error('Sales price must be greater than or equal to cost price.');
      return;
    }
    setLoading(true);
    try {
      const saved = await saveProduct(editItem);
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.id === saved.id);
        return idx >= 0 ? prev.map((p) => p.id === saved.id ? saved : p) : [saved, ...prev];
      });
      toast.success(editItem.id ? 'Product updated.' : 'Product added.');
      setEditItem(null);
    } catch (err) {
      toast.error(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    await deleteProduct(deleteId);
    setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    toast.success('Product deleted.');
    setDeleteId(null);
  };

  const addVariant = () =>
    setEditItem((p) => ({ ...p, variants: [...(p.variants || []), { attribute: '', value: '', extraPrice: 0 }] }));

  const setVariant = (idx, key, val) =>
    setEditItem((p) => {
      const v = [...p.variants];
      v[idx] = { ...v[idx], [key]: key === 'extraPrice' ? parseFloat(val) || 0 : val };
      return { ...p, variants: v };
    });

  const removeVariant = (idx) =>
    setEditItem((p) => ({ ...p, variants: p.variants.filter((_, i) => i !== idx) }));

  const finalPrice = editItem
    ? (parseFloat(editItem.salesPrice) || 0) + (editItem.variants || []).reduce((s, v) => s + (v.extraPrice || 0), 0)
    : 0;

  const columns = [
    { key: 'name',       label: 'Product Name', sortable: true,
      render: (v) => <span className="font-medium text-ink">{v}</span> },
    { key: 'type',       label: 'Type',    sortable: true },
    { key: 'salesPrice', label: 'Sales Price', sortable: true, render: (v) => formatCurrency(v) },
    { key: 'costPrice',  label: 'Cost Price',  render: (v) => formatCurrency(v) },
    {
      key: 'variants', label: 'Variants',
      render: (v) => <span className="text-xs text-ink-soft">{v?.length || 0} variant{v?.length !== 1 ? 's' : ''}</span>,
    },
    {
      key: 'id', label: '', render: (v, row) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 text-ink-soft hover:text-forest transition-colors rounded-lg hover:bg-forest-light">
            <Edit2 size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(v); }} className="p-1.5 text-ink-soft hover:text-coral transition-colors rounded-lg hover:bg-coral/5">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products in catalog`}
        actions={<Button variant="primary" icon={Plus} onClick={openAdd}>Add Product</Button>}
      />

      <div className="bg-paper rounded-2xl border border-border p-5">
        {products.length === 0
          ? <EmptyState icon={Package} title="No products yet" description="Add your first product to the catalog." action={<Button variant="primary" icon={Plus} onClick={openAdd}>Add Product</Button>} />
          : <DataTable columns={columns} data={products} />
        }
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={!!editItem} onClose={() => setEditItem(null)} title={editItem?.id ? 'Edit Product' : 'Add Product'} size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={loading}>Save Product</Button>
          </>
        }
      >
        {editItem && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="Product Name" placeholder="Odoo ERP Core" value={editItem.name} onChange={(e) => setEditItem((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <Select label="Type" value={editItem.type} onChange={(e) => setEditItem((p) => ({ ...p, type: e.target.value }))}>
                <option>Service</option>
                <option>Product</option>
              </Select>
              <div />
              <Input label="Sales Price (₹)" type="number" min="0" placeholder="25000" value={editItem.salesPrice} onChange={(e) => setEditItem((p) => ({ ...p, salesPrice: e.target.value }))} required />
              <Input label="Cost Price (₹)"  type="number" min="0" placeholder="8000"  value={editItem.costPrice}  onChange={(e) => setEditItem((p) => ({ ...p, costPrice: e.target.value }))} />
            </div>

            <Textarea label="Notes" placeholder="Describe the product…" value={editItem.notes} onChange={(e) => setEditItem((p) => ({ ...p, notes: e.target.value }))} />

            {/* Variants */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-ink">Variants</label>
                <Button variant="ghost" size="sm" icon={Plus} onClick={addVariant} type="button">Add Variant</Button>
              </div>
              {(editItem.variants || []).length === 0 ? (
                <p className="text-xs text-ink-soft text-center py-4 bg-cream rounded-xl border border-dashed border-border">
                  No variants. Click "Add Variant" to add one.
                </p>
              ) : (
                <div className="space-y-2">
                  {editItem.variants.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-7 gap-2 items-center">
                      <input className="col-span-2 input-field text-xs" placeholder="Attribute (e.g. Brand)" value={v.attribute} onChange={(e) => setVariant(idx, 'attribute', e.target.value)} />
                      <input className="col-span-2 input-field text-xs" placeholder="Value (e.g. Odoo)" value={v.value} onChange={(e) => setVariant(idx, 'value', e.target.value)} />
                      <input className="col-span-2 input-field text-xs" type="number" placeholder="Extra price" value={v.extraPrice} onChange={(e) => setVariant(idx, 'extraPrice', e.target.value)} />
                      <button type="button" onClick={() => removeVariant(idx)} className="text-coral hover:bg-coral/5 p-1.5 rounded-lg transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Final price preview */}
            {editItem.variants?.length > 0 && (
              <div className="bg-forest-light border border-mint/20 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-forest font-medium">Final price (incl. all variants)</span>
                <span className="font-heading font-bold text-forest text-lg">{formatCurrency(finalPrice)}</span>
              </div>
            )}
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Product" message="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
}
