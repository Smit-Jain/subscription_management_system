import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { forgotPassword } from '../services/auth.service';
import { useToast } from '../../../context/ToastContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO(A): Trigger real password reset email
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-paper rounded-3xl border border-border shadow-warm-lg p-8 animate-slide-up">
          {!sent ? (
            <>
              <div className="text-center mb-7">
                <div className="w-14 h-14 bg-lilac/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} className="text-violet-700" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-ink">Forgot your password?</h1>
                <p className="text-sm text-ink-soft mt-2">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-ink">Email address</label>
                  <input
                    type="email" placeholder="you@company.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    className="w-full bg-cream border border-border rounded-xl px-4 py-2.5 text-sm text-ink placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-forest/40 transition-all"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full justify-center" loading={loading}>
                  Send reset link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 bg-forest-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-forest" />
              </div>
              <h2 className="font-heading text-xl font-bold text-ink mb-2">Check your inbox</h2>
              <p className="text-sm text-ink-soft">
                We've sent password reset instructions to <strong>{email}</strong>.
                It should arrive within a minute.
              </p>
              <p className="text-xs text-ink-soft mt-4">Didn't get it? Check your spam folder.</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors">
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
