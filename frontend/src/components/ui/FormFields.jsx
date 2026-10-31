export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-cream border rounded-xl px-4 py-2.5 text-sm text-ink
          placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest
          transition-all ${error ? 'border-coral' : 'border-border'} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-coral">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-ink">{label}</label>
      )}
      <select
        className={`w-full bg-cream border rounded-xl px-4 py-2.5 text-sm text-ink
          focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest
          transition-all cursor-pointer ${error ? 'border-coral' : 'border-border'} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-coral">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-ink">{label}</label>
      )}
      <textarea
        rows={3}
        className={`w-full bg-cream border rounded-xl px-4 py-2.5 text-sm text-ink
          placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest
          transition-all resize-none ${error ? 'border-coral' : 'border-border'} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-coral">{error}</p>}
    </div>
  );
}
