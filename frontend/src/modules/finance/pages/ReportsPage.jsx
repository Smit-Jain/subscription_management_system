import { useState, useEffect } from 'react';
import { Download, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { StatCard } from '../../../components/ui/StatCard';
import { getRevenueChartData } from '../services/finance.service';
import { formatCurrency } from '../../../utils/index';
import { useToast } from '../../../context/ToastContext';

const PLAN_DATA = [
  { plan: 'Starter',    count: 7,  revenue: 82600 },
  { plan: 'Growth',     count: 9,  revenue: 428400 },
  { plan: 'Enterprise', count: 6,  revenue: 538200 },
  { plan: 'Annual',     count: 2,  revenue: 348000 },
];

export default function ReportsPage() {
  const [chartData, setChartData] = useState([]);
  const toast = useToast();

  useEffect(() => {
    // TODO(D): Replace with real reporting API
    getRevenueChartData().then(setChartData);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Financial summary and analytics"
        actions={
          <Button variant="ghost" icon={Download} onClick={() => toast.success('CSV export started! File will download shortly.')}>
            Export CSV
          </Button>
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="₹14.0L" subtitle="FY 2024–25" icon={BarChart3} bg="bg-forest-light" iconBg="bg-forest/10" iconColor="text-forest" trend={18} />
        <StatCard title="Total Invoiced" value="₹15.6L" subtitle="FY 2024–25" icon={BarChart3} bg="bg-lilac/30" iconBg="bg-violet-100" iconColor="text-violet-600" trend={15} />
        <StatCard title="Avg Invoice Value" value="₹52,340" subtitle="per invoice" icon={BarChart3} bg="bg-marigold/10" iconBg="bg-marigold/20" iconColor="text-amber-700" trend={5} />
        <StatCard title="Collection Rate" value="87%" subtitle="vs target 90%" icon={BarChart3} bg="bg-sky/10" iconBg="bg-sky/20" iconColor="text-sky" trend={-3} />
      </div>

      {/* Revenue chart */}
      <div className="bg-paper rounded-2xl border border-border p-5">
        <h3 className="font-heading font-semibold text-ink mb-4">Monthly Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EADFCB" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B667A' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6B667A' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: '#FFFDF8', border: '1px solid #EADFCB', borderRadius: 12, fontSize: 12 }} formatter={(v) => formatCurrency(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#0E5A55" strokeWidth={2.5} dot={{ fill: '#0E5A55', r: 3 }} />
            <Line type="monotone" dataKey="invoiced" name="Invoiced" stroke="#DCD3F7" strokeWidth={2.5} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-paper rounded-2xl border border-border p-5">
          <h3 className="font-heading font-semibold text-ink mb-4">Revenue by Plan</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={PLAN_DATA} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EADFCB" vertical={false} />
              <XAxis dataKey="plan" tick={{ fontSize: 11, fill: '#6B667A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6B667A' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#FFFDF8', border: '1px solid #EADFCB', borderRadius: 12, fontSize: 12 }} formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="revenue" name="Revenue" fill="#0E5A55" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-paper rounded-2xl border border-border p-5">
          <h3 className="font-heading font-semibold text-ink mb-4">Subscriptions by Plan</h3>
          <div className="space-y-3 mt-2">
            {PLAN_DATA.map((row) => {
              const max = Math.max(...PLAN_DATA.map((r) => r.count));
              const pct = Math.round((row.count / max) * 100);
              const colors = { Starter: 'bg-sky', Growth: 'bg-forest', Enterprise: 'bg-lilac', Annual: 'bg-marigold' };
              return (
                <div key={row.plan}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-ink">{row.plan}</span>
                    <span className="text-ink-soft">{row.count} subs · {formatCurrency(row.revenue)}</span>
                  </div>
                  <div className="w-full bg-border/50 rounded-full h-2">
                    <div className={`${colors[row.plan] || 'bg-forest'} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
