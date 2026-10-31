import { initials } from '../../utils/index';

const COLORS = [
  'bg-forest-light text-forest',
  'bg-lilac text-violet-700',
  'bg-marigold/20 text-amber-700',
  'bg-sky/20 text-sky',
  'bg-coral/10 text-coral',
  'bg-mint/20 text-mint',
];

function colorFor(name = '') {
  let hash = 0;
  for (const c of name) hash = (hash + c.charCodeAt(0)) % COLORS.length;
  return COLORS[hash];
}

export function Avatar({ name = '', src, size = 'md', className = '' }) {
  const sizeCls = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }[size] || 'w-9 h-9 text-sm';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeCls} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeCls} ${colorFor(name)} rounded-full flex items-center justify-center
        font-semibold flex-shrink-0 ${className}`}
    >
      {initials(name)}
    </div>
  );
}
