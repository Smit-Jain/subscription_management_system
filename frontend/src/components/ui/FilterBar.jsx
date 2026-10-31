import { useState } from 'react';
import { CalendarDays, ChevronDown, X } from 'lucide-react';

export function FilterBar({ filters, onFilterChange, onReset }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <div key={filter.key} className="relative">
          {filter.type === 'select' && (
            <div className="relative">
              <select
                value={filter.value || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="appearance-none bg-paper border border-border rounded-xl pl-4 pr-8 py-2 text-sm
                  text-ink focus:outline-none focus:ring-2 focus:ring-forest/30 cursor-pointer"
              >
                <option value="">{filter.placeholder || filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
            </div>
          )}

          {filter.type === 'date' && (
            <div className="relative">
              <input
                type="date"
                value={filter.value || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="bg-paper border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-ink
                  focus:outline-none focus:ring-2 focus:ring-forest/30"
              />
              <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            </div>
          )}

          {filter.type === 'text' && (
            <input
              placeholder={filter.placeholder || filter.label}
              value={filter.value || ''}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="bg-paper border border-border rounded-xl px-4 py-2 text-sm text-ink
                focus:outline-none focus:ring-2 focus:ring-forest/30 w-40"
            />
          )}
        </div>
      ))}

      {onReset && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-ink-soft
            hover:text-coral hover:bg-coral/5 transition-colors border border-border"
        >
          <X size={14} />
          Reset
        </button>
      )}
    </div>
  );
}
