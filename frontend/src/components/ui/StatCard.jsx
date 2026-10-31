import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon: Icon,
  bg = 'bg-forest-light',
  iconBg = 'bg-forest/10',
  iconColor = 'text-forest',
}) {
  const trendPositive = trend > 0;
  const trendNeutral = trend === 0 || trend === undefined;

  return (
    <div className={`${bg} rounded-2xl border border-border p-5 flex flex-col gap-4 shadow-warm`}>
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${iconBg}`}>
          {Icon && <Icon size={20} className={iconColor} />}
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
              ${trendNeutral ? 'bg-ink-soft/10 text-ink-soft' : trendPositive ? 'bg-mint/10 text-mint' : 'bg-coral/10 text-coral'}`}
          >
            {trendNeutral ? <Minus size={12} /> : trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendLabel || (trend > 0 ? `+${trend}%` : `${trend}%`)}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-heading font-bold text-ink">{value}</p>
        <p className="text-sm text-ink-soft mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-ink-soft mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
