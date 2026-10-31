export function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="flex flex-col gap-1 mb-6">
      {breadcrumb && (
        <p className="text-xs text-ink-soft">{breadcrumb}</p>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="text-sm text-ink-soft mt-0.5">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
