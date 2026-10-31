import { PackageOpen } from 'lucide-react';

export function EmptyState({
  icon: Icon = PackageOpen,
  title = 'Nothing here yet',
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-forest-light flex items-center justify-center mb-4">
        <Icon size={28} className="text-forest" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-soft max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
