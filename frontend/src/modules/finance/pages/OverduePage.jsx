import { useState, useEffect } from 'react';
import { AlertCircle, Send, Clock } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusBadge } from '../../../components/ui/Badge';
import { getOverdueInvoices, sendReminder } from '../services/finance.service';
import { formatDate, formatCurrency, daysSince } from '../../../utils/index';
import { useToast } from '../../../context/ToastContext';

export default function OverduePage() {
  const [invoices, setInvoices] = useState([]);
  const [sending, setSending] = useState(null);
  const toast = useToast();

  useEffect(() => {
    // TODO(D): Replace with real API
    getOverdueInvoices().then(setInvoices);
  }, []);

  const handleSendReminder = async (inv) => {
    // TODO(D): Trigger real email reminder via /invoices/:id/send-reminder
    setSending(inv.id);
    try {
      await sendReminder(inv.id);
      toast.success(`Reminder sent to ${inv.customerName}.`);
    } catch {
      toast.error('Failed to send reminder.');
    } finally {
      setSending(null);
    }
  };

  const totalOverdue = invoices.reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Overdue Invoices"
        subtitle="Invoices that have passed their due date"
      />

      {/* Summary */}
      <div className="bg-coral/10 border border-coral/20 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-coral/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertCircle size={20} className="text-coral" />
        </div>
        <div>
          <p className="font-heading font-bold text-ink">{invoices.length} Overdue Invoice{invoices.length !== 1 ? 's' : ''}</p>
          <p className="text-sm text-ink-soft">Total outstanding: <span className="font-semibold text-coral">{formatCurrency(totalOverdue)}</span></p>
        </div>
      </div>

      {/* Chase list */}
      <div className="bg-paper rounded-2xl border border-border overflow-hidden">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 bg-forest-light rounded-2xl flex items-center justify-center">
              <AlertCircle size={24} className="text-forest" />
            </div>
            <p className="font-heading font-semibold text-ink">No overdue invoices</p>
            <p className="text-sm text-ink-soft">Great job! All invoices are on track.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {invoices.map((inv) => {
              const days = daysSince(inv.dueDate);
              const urgency = days > 60 ? 'text-coral font-bold' : days > 30 ? 'text-marigold font-semibold' : 'text-ink-soft';
              return (
                <div key={inv.id} className="flex items-center justify-between px-5 py-4 hover:bg-cream/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar name={inv.customerName} size="sm" />
                    <div>
                      <p className="font-medium text-sm text-ink">{inv.customerName}</p>
                      <p className="text-xs text-ink-soft">{inv.number} · Due {formatDate(inv.dueDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock size={12} className={urgency} />
                      <span className={urgency}>{days} day{days !== 1 ? 's' : ''} overdue</span>
                    </div>
                    <p className="font-semibold text-coral min-w-[80px] text-right">{formatCurrency(inv.total)}</p>
                    <StatusBadge status="overdue" />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Send}
                      loading={sending === inv.id}
                      onClick={() => handleSendReminder(inv)}
                    >
                      Remind
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
