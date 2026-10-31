import { useState } from 'react';
import { useRole, ROLES } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, UserCog } from 'lucide-react';

// TODO(A): Replace this entire component with real auth context once auth is implemented.
// Remove the floating role switcher widget from production builds.

const ROLE_CONFIG = {
  [ROLES.ADMIN]: {
    label: 'Admin',
    description: 'Full access',
    color: 'bg-forest text-paper',
    redirect: '/admin/dashboard',
  },
  [ROLES.STAFF]: {
    label: 'Staff',
    description: 'Limited access',
    color: 'bg-sky text-ink',
    redirect: '/admin/dashboard',
  },
  [ROLES.CUSTOMER]: {
    label: 'Customer',
    description: 'Customer portal',
    color: 'bg-marigold text-ink',
    redirect: '/customer/subscriptions',
  },
};

export default function DemoRoleSwitcher() {
  const { role, switchRole } = useRole();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const current = ROLE_CONFIG[role] || ROLE_CONFIG[ROLES.ADMIN];

  const handleSwitch = (newRole) => {
    switchRole(newRole);
    setOpen(false);
    navigate(ROLE_CONFIG[newRole].redirect);
  };

  return (
    <div className="fixed bottom-6 right-4 z-50">
      {/* Panel */}
      {open && (
        <div className="mb-2 bg-paper border border-border rounded-2xl shadow-warm-lg overflow-hidden animate-slide-up w-52">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide">Demo Role</p>
          </div>
          {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => handleSwitch(key)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium
                transition-colors hover:bg-cream text-left
                ${role === key ? 'text-forest font-semibold' : 'text-ink'}`}
            >
              <div>
                <span>{cfg.label}</span>
                <p className="text-xs text-ink-soft">{cfg.description}</p>
              </div>
              {role === key && (
                <span className="w-2 h-2 rounded-full bg-forest" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl shadow-warm-lg
          border border-border text-sm font-semibold transition-all hover:shadow-warm-md
          ${current.color}`}
      >
        <UserCog size={15} />
        {current.label}
        {open ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
      </button>
    </div>
  );
}
