import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { login } from '../services/auth.service';
import { useToast } from '../../../context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO(A): Add real validation and JWT storage
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Signed in successfully!');
      navigate('/admin/dashboard');
    } catch {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      {/* Blob decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 blob-forest opacity-50 rounded-full" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 blob-lilac opacity-40 rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-paper rounded-3xl border border-border shadow-warm-lg p-8 animate-slide-up">
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-forest-light rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RefreshLoopIcon />
            </div>
            <h1 className="font-heading text-2xl font-bold text-ink">Welcome back</h1>
            <p className="text-sm text-ink-soft mt-1">Sign in to your Brightloop account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Email address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-cream border border-border rounded-xl px-4 py-2.5 text-sm text-ink
                  placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-ink">Password</label>
                <Link to="/forgot-password" className="text-xs text-forest hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-cream border border-border rounded-xl px-4 py-2.5 pr-10 text-sm text-ink
                    placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center mt-2"
              loading={loading}
              icon={ArrowRight}
              iconRight
            >
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-ink-soft mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-forest font-semibold hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RefreshLoopIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <path d="M16 8C11.6 8 8 11.6 8 16s3.6 8 8 8c2.4 0 4.5-1 6-2.6" stroke="#0E5A55" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M20 5.5l3 3-3 3" stroke="#F6B73C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
