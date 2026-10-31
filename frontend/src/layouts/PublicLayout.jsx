import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/RoleContext';

export default function PublicLayout() {
  const { isAuthenticated, role } = useAuth();
  const { pathname } = useLocation();

  // If already logged in and trying to visit /login or /signup, go to dashboard
  if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    const dest = role === 'customer' ? '/customer/subscriptions' : '/admin/dashboard';
    return <Navigate to={dest} replace />;
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Minimal public nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border bg-paper/80 backdrop-blur-md sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2.5">
          <LoopLogo />
          <span className="font-heading font-bold text-xl text-ink">Brightloop</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-ink-soft hover:text-ink transition-colors">Sign in</Link>
          <Link
            to="/signup"
            className="bg-forest text-paper rounded-xl px-5 py-2 text-sm font-semibold
              hover:bg-opacity-90 transition-all shadow-warm"
          >
            Get started
          </Link>
        </div>
      </nav>

      <Outlet />

      {/* Footer */}
      <footer className="border-t border-border bg-paper/50 px-6 md:px-12 py-8 mt-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ink-soft">
          <div className="flex items-center gap-2">
            <LoopLogo size={20} />
            <span className="font-heading font-semibold text-ink">Brightloop Software</span>
          </div>
          <p>© 2025 Brightloop Software. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export function LoopLogo({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#0E5A55" />
      <path
        d="M16 8C11.6 8 8 11.6 8 16s3.6 8 8 8c2.4 0 4.5-1 6-2.6"
        stroke="#DDF0EA"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 5.5l3 3-3 3"
        stroke="#F6B73C"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
