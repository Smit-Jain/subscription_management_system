const STATUS_CONFIG = {
  // Subscription statuses
  draft:      { label: 'Draft',       bg: 'bg-ink-soft/10',      text: 'text-ink-soft',  border: 'border-ink-soft/20' },
  quotation:  { label: 'Quotation',   bg: 'bg-sky/10',           text: 'text-sky',       border: 'border-sky/20' },
  confirmed:  { label: 'Confirmed',   bg: 'bg-lilac/30',         text: 'text-violet-700',border: 'border-lilac/40' },
  active:     { label: 'Active',      bg: 'bg-forest-light',     text: 'text-forest',    border: 'border-mint/30' },
  paused:     { label: 'Paused',      bg: 'bg-marigold/10',      text: 'text-amber-700', border: 'border-marigold/30' },
  closed:     { label: 'Closed',      bg: 'bg-ink-soft/10',      text: 'text-ink-soft',  border: 'border-ink-soft/20' },
  cancelled:  { label: 'Cancelled',   bg: 'bg-coral/10',         text: 'text-coral',     border: 'border-coral/30' },
  overdue:    { label: 'Overdue',     bg: 'bg-coral/10',         text: 'text-coral',     border: 'border-coral/30' },
  // Invoice statuses
  paid:       { label: 'Paid',        bg: 'bg-forest-light',     text: 'text-forest',    border: 'border-mint/30' },
  pending:    { label: 'Pending',     bg: 'bg-marigold/10',      text: 'text-amber-700', border: 'border-marigold/30' },
  outstanding:{ label: 'Outstanding', bg: 'bg-marigold/10',      text: 'text-amber-700', border: 'border-marigold/30' },
  // Staff
  inactive:   { label: 'Inactive',    bg: 'bg-ink-soft/10',      text: 'text-ink-soft',  border: 'border-ink-soft/20' },
  // Payment
  completed:  { label: 'Completed',   bg: 'bg-forest-light',     text: 'text-forest',    border: 'border-mint/30' },
  partial:    { label: 'Partial',     bg: 'bg-sky/10',           text: 'text-sky',       border: 'border-sky/20' },
};

export function StatusBadge({ status, className = '' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        border ${cfg.bg} ${cfg.text} ${cfg.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.text.replace('text-', 'bg-')}`} />
      {cfg.label}
    </span>
  );
}

export function Badge({ children, color = 'ink-soft', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-${color}/10 text-${color} ${className}`}
    >
      {children}
    </span>
  );
}
