import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, FileText, CreditCard,
  BookOpen, Receipt, AlertCircle, BarChart3, Tag, Percent,
  UserCog, X, Menu, LogOut, ChevronDown, ChevronRight, Bell,
  RefreshCw,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { Avatar } from '../components/ui/Avatar';

const ALL_NAV = [
  { key: 'dashboard',    label: 'Dashboard',            icon: LayoutDashboard, path: '/admin/dashboard',    roles: ['admin', 'staff'] },
  { key: 'customers',   label: 'Customers',             icon: Users,           path: '/admin/customers',    roles: ['admin', 'staff'] },
  { key: 'products',    label: 'Products',              icon: Package,         path: '/admin/products',     roles: ['admin'] },
  { key: 'plans',       label: 'Plans',                 icon: BookOpen,        path: '/admin/plans',        roles: ['admin'] },
  { key: 'templates',   label: 'Quotation Templates',   icon: FileText,        path: '/admin/templates',    roles: ['admin', 'staff'] },
  { key: 'subs',        label: 'Subscriptions',         icon: RefreshCw,       path: '/admin/subscriptions',roles: ['admin', 'staff'] },
  { key: 'invoices',    label: 'Invoices',              icon: Receipt,         path: '/admin/invoices',     roles: ['admin', 'staff'] },
  { key: 'payments',    label: 'Payments',              icon: CreditCard,      path: '/admin/payments',     roles: ['admin', 'staff'] },
  { key: 'overdue',     label: 'Overdue',               icon: AlertCircle,     path: '/admin/overdue',      roles: ['admin', 'staff'] },
  { key: 'taxes',       label: 'Taxes',                 icon: Tag,             path: '/admin/taxes',        roles: ['admin'] },
  { key: 'discounts',   label: 'Discounts',             icon: Percent,         path: '/admin/discounts',    roles: ['admin'] },
  { key: 'reports',     label: 'Reports',               icon: BarChart3,       path: '/admin/reports',      roles: ['admin', 'staff'] },
  { key: 'staff',       label: 'Staff Management',      icon: UserCog,         path: '/admin/staff',        roles: ['admin'] },
];

function SidebarContent({ role, onClose }) {
  const nav = ALL_NAV.filter((item) => item.roles.includes(role));

  return (
    <div className="flex flex-col h-full bg-ink text-white select-none">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <BrandLogo />
          <div>
            <p className="font-heading font-bold text-white leading-none">Brightloop</p>
            <p className="text-[10px] text-white/40 mt-0.5">Software</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-white/50 hover:text-white transition-colors md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Role chip */}
      <div className="mx-4 mt-4 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/30 px-1">
          {role === 'admin' ? 'Administrator' : 'Staff Member'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {nav.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-marigold text-ink transition-all'
                : 'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all'
            }
          >
            <item.icon size={16} className="flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar name="Deepa Nambiar" size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Deepa Nambiar</p>
            <p className="text-xs text-white/40 truncate">deepa@brightloop.io</p>
          </div>
          <button className="p-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/10">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function BrandLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#0E5A55" />
      <path d="M16 8C11.6 8 8 11.6 8 16s3.6 8 8 8c2.4 0 4.5-1 6-2.6" stroke="#DDF0EA" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M20 5.5l3 3-3 3" stroke="#F6B73C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function AdminLayout() {
  const { role } = useRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0">
        <SidebarContent role={role} />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 z-50">
            <SidebarContent role={role} onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-paper/80 backdrop-blur-md flex-shrink-0">
          <button
            className="p-2 rounded-xl hover:bg-cream text-ink-soft hover:text-ink transition-colors md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="hidden md:block" />

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-cream text-ink-soft hover:text-ink transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Avatar name="Deepa Nambiar" size="sm" />
              <ChevronDown size={14} className="text-ink-soft" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
