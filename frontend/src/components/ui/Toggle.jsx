export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`w-10 h-6 rounded-full transition-colors ${
            checked ? 'bg-forest' : 'bg-border'
          }`}
        />
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </div>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-ink">{label}</p>}
          {description && <p className="text-xs text-ink-soft">{description}</p>}
        </div>
      )}
    </label>
  );
}
