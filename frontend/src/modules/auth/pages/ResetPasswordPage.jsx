import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X as XIcon, KeyRound } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { resetPassword } from '../services/auth.service';
import { useToast } from '../../../context/ToastContext';

function checkPassword(pw) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const rules = checkPassword(form.password);
  const allRulesMet = Object.values(rules).every(Boolean);
  const passwordMatch = form.password === form.confirm && form.confirm.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRulesMet || !passwordMatch) return;
    // TODO(A): Extract token from URL params and call real reset API
    setLoading(true);
    try {
      await resetPassword('mock-token', form.password);
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch {
      toast.error('Reset link may have expired. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-paper rounded-3xl border border-border shadow-warm-lg p-8 animate-slide-up">
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-marigold/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <KeyRound size={24} className="text-amber-700" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-ink">Set new password</h1>
            <p className="text-sm text-ink-soft mt-1">Choose a strong password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">New password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} placeholder="Create a strong password"
                  value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required
                  className="w-full bg-cream border border-border rounded-xl px-4 py-2.5 pr-10 text-sm text-ink placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-forest/40 transition-all"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {form.password.length > 0 && (
                <div className="bg-cream border border-border rounded-xl p-3 grid grid-cols-2 gap-1.5">
                  {[
                    [rules.length,  'At least 8 characters'],
                    [rules.upper,   'One uppercase letter'],
                    [rules.lower,   'One lowercase letter'],
                    [rules.special, 'One special character'],
                  ].map(([met, text]) => (
                    <div key={text} className={`flex items-center gap-2 text-xs ${met ? 'text-mint' : 'text-ink-soft'}`}>
                      {met ? <Check size={12} strokeWidth={3} /> : <XIcon size={12} />}
                      {text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Confirm password</label>
              <input
                type="password" placeholder="Repeat your password"
                value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} required
                className={`w-full bg-cream border rounded-xl px-4 py-2.5 text-sm text-ink placeholder-ink-soft focus:outline-none focus:ring-2 transition-all
                  ${form.confirm.length > 0 ? (passwordMatch ? 'border-mint focus:ring-mint/40' : 'border-coral focus:ring-coral/40') : 'border-border focus:ring-forest/40'}`}
              />
            </div>

            <Button
              type="submit" variant="primary" size="lg" className="w-full justify-center mt-2"
              loading={loading} disabled={!allRulesMet || !passwordMatch}
            >
              Reset password
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-ink-soft hover:text-ink transition-colors">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
