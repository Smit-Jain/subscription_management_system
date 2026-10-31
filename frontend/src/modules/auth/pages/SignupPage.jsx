import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X as XIcon, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { signup } from '../services/auth.service';
import { useToast } from '../../../context/ToastContext';

function PasswordRule({ met, text }) {
  return (
    <div className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-mint' : 'text-ink-soft'}`}>
      {met ? <Check size={12} strokeWidth={3} /> : <XIcon size={12} />}
      {text}
    </div>
  );
}

function checkPassword(pw) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const rules = checkPassword(form.password);
  const allRulesMet = Object.values(rules).every(Boolean);
  const passwordMatch = form.password === form.confirm && form.confirm.length > 0;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRulesMet) { toast.error('Please meet all password requirements.'); return; }
    if (!passwordMatch) { toast.error('Passwords do not match.'); return; }
    // TODO(A): Add real signup logic + email verification flow
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch {
      toast.error('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 blob-marigold opacity-50 rounded-full" />
        <div className="absolute bottom-20 left-10 w-64 h-64 blob-forest opacity-40 rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-paper rounded-3xl border border-border shadow-warm-lg p-8 animate-slide-up">
          <div className="text-center mb-7">
            <h1 className="font-heading text-2xl font-bold text-ink">Create your account</h1>
            <p className="text-sm text-ink-soft mt-1">Start your Brightloop journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Full name</label>
              <input
                type="text" placeholder="Arjun Mehta" value={form.name} onChange={set('name')} required
                className="w-full bg-cream border border-border rounded-xl px-4 py-2.5 text-sm text-ink placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-forest/40 transition-all"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Work email</label>
              <input
                type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required
                className="w-full bg-cream border border-border rounded-xl px-4 py-2.5 text-sm text-ink placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-forest/40 transition-all"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} placeholder="Create a strong password"
                  value={form.password} onChange={set('password')} required
                  className="w-full bg-cream border border-border rounded-xl px-4 py-2.5 pr-10 text-sm text-ink placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-forest/40 transition-all"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password rules checklist */}
              {form.password.length > 0 && (
                <div className="bg-cream border border-border rounded-xl p-3 grid grid-cols-2 gap-1.5 mt-1">
                  <PasswordRule met={rules.length}  text="At least 8 characters" />
                  <PasswordRule met={rules.upper}   text="One uppercase letter" />
                  <PasswordRule met={rules.lower}   text="One lowercase letter" />
                  <PasswordRule met={rules.special} text="One special character" />
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Confirm password</label>
              <input
                type="password" placeholder="Repeat your password"
                value={form.confirm} onChange={set('confirm')} required
                className={`w-full bg-cream border rounded-xl px-4 py-2.5 text-sm text-ink placeholder-ink-soft focus:outline-none focus:ring-2 transition-all
                  ${form.confirm.length > 0 ? (passwordMatch ? 'border-mint focus:ring-mint/40' : 'border-coral focus:ring-coral/40') : 'border-border focus:ring-forest/40'}`}
              />
              {form.confirm.length > 0 && !passwordMatch && (
                <p className="text-xs text-coral">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit" variant="primary" size="lg" className="w-full justify-center mt-2"
              loading={loading} icon={ArrowRight} iconRight
            >
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-ink-soft mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-forest font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
