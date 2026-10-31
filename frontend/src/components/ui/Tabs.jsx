import { useState } from 'react';

export function Tabs({ tabs, defaultTab, children }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key);

  return (
    <div>
      <div className="flex gap-1 bg-cream border border-border rounded-xl p-1 w-fit mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${active === tab.key
                ? 'bg-paper text-ink shadow-warm border border-border'
                : 'text-ink-soft hover:text-ink'
              }`}
          >
            {tab.icon && <tab.icon size={14} />}
            {tab.label}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}
