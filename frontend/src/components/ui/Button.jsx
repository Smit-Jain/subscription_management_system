import { clsx } from 'clsx';

const variants = {
  primary: 'bg-forest text-paper hover:bg-opacity-90 hover:shadow-warm-md',
  accent:  'bg-marigold text-ink hover:brightness-105 hover:shadow-warm-md',
  ghost:   'bg-transparent text-ink-soft border border-border hover:bg-cream hover:text-ink',
  danger:  'bg-coral text-white hover:brightness-105 hover:shadow-warm-md',
  outline: 'bg-transparent text-forest border border-forest hover:bg-forest-light',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconRight,
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-2 rounded-xl font-semibold transition-all active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-forest/40',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
      ) : Icon && !iconRight ? (
        <Icon size={size === 'sm' ? 14 : 16} />
      ) : null}
      {children}
      {Icon && iconRight ? <Icon size={size === 'sm' ? 14 : 16} /> : null}
    </button>
  );
}
