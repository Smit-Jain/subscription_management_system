import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, RefreshCw, BarChart3, CreditCard, Shield, Zap } from 'lucide-react';

const features = [
  { icon: RefreshCw,  title: 'Smart Subscriptions',   desc: 'Automate billing cycles with flexible daily, weekly, monthly, and yearly plans with pause & renew support.' },
  { icon: BarChart3,  title: 'Revenue Intelligence',   desc: 'Real-time dashboards with revenue trends, invoice aging, and overdue alerts to keep cash flow healthy.' },
  { icon: CreditCard, title: 'Unified Payments',       desc: 'Track every payment, partial or full, across bank transfer, UPI, cheque, and card — all in one place.' },
  { icon: Shield,     title: 'Tax & Discount Engine',  desc: 'Configurable GST, TDS, IGST tax profiles and rich discount campaigns with usage limits.' },
  { icon: Zap,        title: 'Instant Invoicing',      desc: 'Generate, confirm, and send professional invoices in seconds. Auto-generate from active subscriptions.' },
  { icon: CheckCircle,title: 'Customer Portal',        desc: 'Give customers a self-service portal to view subscriptions, download invoices, and track payments.' },
];

const plans = [
  {
    name: 'Starter',     price: '₹9,900',  period: '/mo', badge: null,   bg: 'bg-paper',
    color: 'border-border',
    features: ['Up to 5 users','CRM & Helpdesk','Email support','5 GB storage','Basic reports'],
    cta: 'Get started',
  },
  {
    name: 'Growth',      price: '₹24,900', period: '/mo', badge: 'Most popular', bg: 'bg-forest',
    color: 'border-forest',
    features: ['Up to 25 users','All Starter features','Accounting & HR','Priority support','50 GB storage','Advanced analytics'],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Enterprise',  price: '₹59,900', period: '/mo', badge: null,   bg: 'bg-paper',
    color: 'border-border',
    features: ['Unlimited users','All modules','Dedicated hosting','4-hr SLA','Custom dev hours','500 GB storage'],
    cta: 'Contact sales',
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative px-6 md:px-12 pt-20 pb-24 text-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] blob-forest opacity-30 rounded-full" />
          <div className="dot-pattern absolute inset-0 opacity-30" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-forest-light border border-mint/30 text-forest text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse-slow" />
            Now available — Brightloop v2.0
          </div>

          <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-ink max-w-3xl mx-auto leading-tight">
            Subscription billing,{' '}
            <span className="text-gradient-forest">beautifully simple.</span>
          </h1>

          <p className="text-lg text-ink-soft max-w-xl mx-auto mt-5 leading-relaxed">
            Brightloop helps software companies manage customers, plans, subscriptions,
            invoices, and payments — all in one elegant platform.
          </p>

          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            <Link to="/signup" className="flex items-center gap-2 bg-forest text-paper rounded-2xl px-7 py-3.5 font-semibold hover:bg-opacity-90 transition-all shadow-warm-md hover:shadow-warm-lg text-base">
              Start for free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="flex items-center gap-2 bg-paper text-ink border border-border rounded-2xl px-7 py-3.5 font-semibold hover:bg-cream transition-all shadow-warm text-base">
              Sign in
            </Link>
          </div>

          <p className="text-xs text-ink-soft mt-4">No credit card required · 14-day free trial</p>

          {/* Mock dashboard preview */}
          <div className="mt-14 relative max-w-4xl mx-auto">
            <div className="bg-paper rounded-3xl border border-border shadow-warm-lg overflow-hidden">
              <div className="bg-ink px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-coral" />
                  <div className="w-3 h-3 rounded-full bg-marigold" />
                  <div className="w-3 h-3 rounded-full bg-mint" />
                </div>
                <div className="flex-1 bg-white/10 rounded-lg h-5 text-white/40 text-xs flex items-center px-3">brightloop.io/admin/dashboard</div>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Active Subscriptions', val: '142', bg: 'bg-forest-light', text: 'text-forest' },
                  { label: 'Revenue Collected',    val: '₹48.2L', bg: 'bg-lilac/30',   text: 'text-violet-700' },
                  { label: 'Amount Owed',          val: '₹3.1L',  bg: 'bg-marigold/15',text: 'text-amber-700' },
                  { label: 'Overdue Invoices',     val: '7',      bg: 'bg-coral/10',   text: 'text-coral' },
                ].map((s) => (
                  <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-border`}>
                    <p className={`font-heading font-bold text-xl ${s.text}`}>{s.val}</p>
                    <p className="text-xs text-ink-soft mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6">
                <div className="bg-cream rounded-2xl h-28 flex items-end justify-around px-6 py-4 border border-border gap-1">
                  {[60, 75, 55, 90, 85, 70, 95, 80, 88, 92, 78, 100].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-lg bg-forest" style={{ height: `${h}%`, opacity: 0.6 + i * 0.03 }} />
                  ))}
                </div>
                <p className="text-xs text-ink-soft text-center mt-2">Monthly revenue — Jan to Dec 2024</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-20 bg-paper border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink">Everything you need</h2>
            <p className="text-ink-soft mt-3 max-w-lg mx-auto">From first quotation to final payment — Brightloop handles the complete subscription lifecycle.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-cream rounded-2xl border border-border p-6 hover:border-forest/30 hover:shadow-warm-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-forest-light flex items-center justify-center mb-4 group-hover:bg-forest group-hover:text-paper transition-all">
                  <f.icon size={18} className="text-forest group-hover:text-paper transition-colors" />
                </div>
                <h3 className="font-heading font-semibold text-ink mb-2">{f.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink">Simple, transparent pricing</h2>
            <p className="text-ink-soft mt-3">Choose the plan that fits your team size and ambitions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-3xl border-2 ${p.color} ${p.highlight ? 'bg-forest text-paper shadow-warm-lg scale-[1.02]' : 'bg-paper shadow-warm'} p-7 relative`}
              >
                {p.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-marigold text-ink text-xs font-bold px-4 py-1 rounded-full shadow-warm">
                      {p.badge}
                    </span>
                  </div>
                )}
                <p className={`font-heading font-bold text-lg ${p.highlight ? 'text-paper' : 'text-ink'}`}>{p.name}</p>
                <div className="flex items-end gap-1 mt-2 mb-5">
                  <span className={`font-heading font-extrabold text-3xl ${p.highlight ? 'text-paper' : 'text-ink'}`}>{p.price}</span>
                  <span className={`text-sm mb-1 ${p.highlight ? 'text-paper/60' : 'text-ink-soft'}`}>{p.period}</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2.5 text-sm ${p.highlight ? 'text-paper/80' : 'text-ink-soft'}`}>
                      <CheckCircle size={15} className={p.highlight ? 'text-mint flex-shrink-0' : 'text-forest flex-shrink-0'} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`block text-center rounded-xl py-2.5 font-semibold text-sm transition-all
                    ${p.highlight
                      ? 'bg-marigold text-ink hover:brightness-105'
                      : 'bg-forest text-paper hover:bg-opacity-90'
                    }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-20 bg-ink text-white relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to simplify your billing?
          </h2>
          <p className="text-white/60 mb-8 text-lg">Join 500+ software companies who trust Brightloop to run their subscription business.</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-marigold text-ink rounded-2xl px-8 py-3.5 font-bold text-base hover:brightness-105 transition-all shadow-warm-md"
          >
            Get started free <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
