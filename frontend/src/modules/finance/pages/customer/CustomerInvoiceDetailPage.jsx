import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { StatusBadge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { getCustomerInvoice, getCustomerInvoices } from '../../services/finance.service';
import { formatDate, formatCurrency } from '../../../../utils/index';
import { useToast } from '../../../../context/ToastContext';
import { useAuth } from '../../../../context/RoleContext';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function CustomerInvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    getCustomerInvoice(id).then((found) => {
      if (found) {
        setInvoice(found);
      } else if (user?.id) {
        getCustomerInvoices(user.id).then((list) => {
          setInvoice(list.find((i) => i.id === id) || null);
        });
      }
    });
  }, [id, user?.id]);

  const handleDownloadPdf = () => {
    toast.success('Opening invoice PDF…');
    const token = localStorage.getItem('brightloop_token') || '';
    window.open(`${BASE}/billing/invoices/${invoice.id}/pdf${token ? `?token=${encodeURIComponent(token)}` : ''}`, '_blank');
  };

  if (!invoice) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-6 h-6 border-2 border-forest border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-5 max-w-3xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors">
        <ArrowLeft size={16} /> Back to Invoices
      </button>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="font-heading font-bold text-2xl text-ink">{invoice.number}</h1>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" icon={Download} onClick={handleDownloadPdf}>Download PDF</Button>
          <Button variant="ghost" icon={Printer} onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      <div className="bg-paper rounded-2xl border border-border p-8">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
          <div>
            <p className="font-heading font-bold text-xl text-ink">Brightloop Software</p>
            <p className="text-xs text-ink-soft mt-1 leading-relaxed">123 Tech Park, Koramangala<br/>Bengaluru, Karnataka 560034</p>
          </div>
          <div className="text-right">
            <p className="font-heading font-extrabold text-4xl text-ink-soft/20">INVOICE</p>
            <p className="text-sm font-bold text-ink">{invoice.number}</p>
            <p className="text-xs text-ink-soft">Issue: {formatDate(invoice.issueDate)}</p>
            <p className="text-xs text-ink-soft">Due: {formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        <div className="bg-cream rounded-xl p-4 mb-6 border border-border">
          <p className="text-xs font-semibold text-ink-soft uppercase mb-1">Bill To</p>
          <p className="font-semibold text-ink">{invoice.customerName || user?.name || 'Customer'}</p>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b-2 border-border">
              {['Description', 'Qty', 'Unit Price', 'Amount'].map((h) => (
                <th key={h} className="py-2 text-left text-xs font-bold text-ink-soft uppercase last:text-right">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(invoice.lines?.length ? invoice.lines : [{ product: 'Subscription Services', qty: 1, unitPrice: invoice.subtotal, amount: invoice.subtotal }]).map((l, i) => (
              <tr key={i} className="border-b border-border/40">
                <td className="py-3 font-medium">{l.product || l.description}</td>
                <td className="py-3 text-ink-soft">{l.qty || l.quantity}</td>
                <td className="py-3 text-ink-soft">{formatCurrency(l.unitPrice)}</td>
                <td className="py-3 font-semibold text-right">{formatCurrency(l.amount || l.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-48 space-y-1.5 text-sm">
            <div className="flex justify-between text-ink-soft"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            <div className="flex justify-between text-ink-soft"><span>Tax</span><span>{formatCurrency(invoice.tax || invoice.taxTotal)}</span></div>
            <div className="flex justify-between font-bold text-ink border-t border-border pt-1.5">
              <span>Total</span><span className="text-forest">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
