import { NavLink, Outlet, Link } from 'react-router-dom';
import { RefreshCw, Receipt, CreditCard, User, Bell, ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '../components/ui/Avatar';
import { mockCurrentCustomer } from '../mock/users';

const CUSTOMER_NAV = [
  { label: 'My Subscriptions', path: '/customer/subscriptions', icon: RefreshCw },
  { label: 'My Invoices',      path: '/customer/invoices',      icon: Receipt },
  { label: 'My Payments',      path: '/customer/payments',      icon: CreditCard },
  { label: 'Profile',          path: '/customer/profile',       icon: User },
];

export default function CustomerLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const customer = mockCurrentCustomer;

  return (
    <div className="min-h-screen bg-cream">
      {/* Top navbar */}
      <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/customer/subscriptions" className="flex items-center gap-2.5">
              <BrandLogoSmall />
              <span className="font-heading font-bold text-lg text-ink">Brightloop</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {CUSTOMER_NAV.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-forest-light text-forest'
                      : 'text-ink-soft hover:text-ink hover:bg-cream'
                    }`
                  }
                >
                  <item.icon size={15} />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-xl hover:bg-cream text-ink-soft hover:text-ink transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral rounded-full" />
              </button>
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-border">
                <Avatar name={customer.name} size="sm" />
                <div>
                  <p className="text-xs font-semibold text-ink leading-none">{customer.name}</p>
                  <p className="text-[10px] text-ink-soft">{customer.company}</p>
                </div>
                <ChevronDown size={13} className="text-ink-soft" />
              </div>
              <button
                className="p-2 rounded-xl hover:bg-cream text-ink-soft md:hidden"
                onClick={() => setMobileNavOpen((v) => !v)}
              >
                {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileNavOpen && (
            <div className="md:hidden py-3 border-t border-border flex flex-col gap-1">
              {CUSTOMER_NAV.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive ? 'bg-forest-light text-forest' : 'text-ink-soft hover:text-ink hover:bg-cream'}`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function BrandLogoSmall() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#0E5A55" />
      <path d="M16 8C11.6 8 8 11.6 8 16s3.6 8 8 8c2.4 0 4.5-1 6-2.6" stroke="#DDF0EA" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M20 5.5l3 3-3 3" stroke="#F6B73C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
