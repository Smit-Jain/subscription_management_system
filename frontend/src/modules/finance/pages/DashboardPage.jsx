import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { RefreshCw, DollarSign, AlertCircle, TrendingUp, Zap, Download } from 'lucide-react';
import { StatCard } from '../../../components/ui/StatCard';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { FilterBar } from '../../../components/ui/FilterBar';
import { StatusBadge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { getDashboardStats, getRevenueChartData, exportCsv } from '../services/finance.service';
import { formatCurrency, formatDate } from '../../../utils/index';
import { useToast } from '../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const PIE_COLORS = ['#3FBF8F', '#F6B73C', '#FF6A4D', '#DCD3F7', '#7CC4F0', '#6B667A'];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', status: '', plan: '' });
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats(filters).then(setStats);
    getRevenueChartData().then(setChartData);
  }, [filters]);

  const handleFilterChange = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const overdueInvoices = stats?.overdueInvoices || [];
  const recentPayments  = stats?.recentPayments || [];
  const invoiceStatusData = stats?.invoiceStatusData?.filter((d) => d.value > 0) || [];

  const handleExport = () => {
    toast.info('Export started…');
    exportCsv();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Financial overview for Brightloop Software"
        actions={
          <Button variant="ghost" icon={Download} onClick={handleExport}>
            Export
          </Button>
        }
      />

      {/* Filters */}
      <FilterBar
        filters={[
          { key: 'dateFrom', type: 'date', label: 'From', value: filters.dateFrom },
          { key: 'dateTo',   type: 'date', label: 'To',   value: filters.dateTo },
          { key: 'status',   type: 'select', label: 'Status', value: filters.status,
            options: [{ value: 'active', label: 'Active' }, { value: 'overdue', label: 'Overdue' }, { value: 'paused', label: 'Paused' }] },
          { key: 'plan',     type: 'select', label: 'Plan', value: filters.plan,
            options: [{ value: 'Starter', label: 'Starter' }, { value: 'Growth', label: 'Growth' }, { value: 'Enterprise', label: 'Enterprise' }] },
        ]}
        onFilterChange={handleFilterChange}
        onReset={() => setFilters({ dateFrom: '', dateTo: '', status: '', plan: '' })}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions ?? 0}
          subtitle="Total active subscriptions"
          icon={RefreshCw}
          bg="bg-forest-light"
          iconBg="bg-forest/10"
          iconColor="text-forest"
        />
        <StatCard
          title="Revenue Collected"
          value={stats ? formatCurrency(stats.revenueCollected, { compact: true }) : '₹0'}
          subtitle="Total payments received"
          icon={DollarSign}
          bg="bg-lilac/30"
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />
        <StatCard
          title="Amount Owed"
          value={stats ? formatCurrency(stats.amountOwed, { compact: true }) : '₹0'}
          subtitle="Outstanding invoices"
          icon={TrendingUp}
          bg="bg-marigold/10"
          iconBg="bg-marigold/20"
          iconColor="text-amber-700"
        />
        <StatCard
          title="Overdue Invoices"
          value={stats?.overdueCount ?? 0}
          subtitle="Require follow-up"
          icon={AlertCircle}
          bg="bg-coral/10"
          iconBg="bg-coral/10"
          iconColor="text-coral"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-paper rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-ink">Revenue vs Invoiced</h3>
              <p className="text-xs text-ink-soft mt-0.5">12-month view</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-soft">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-forest inline-block" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-lilac inline-block" />Invoiced</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0E5A55" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#0E5A55" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#DCD3F7" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#DCD3F7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EADFCB" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B667A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6B667A' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: '#FFFDF8', border: '1px solid #EADFCB', borderRadius: 12, fontSize: 12 }}
                formatter={(v) => formatCurrency(v)}
              />
              <Area type="monotone" dataKey="invoiced" stroke="#DCD3F7" strokeWidth={2} fill="url(#invGrad)" />
              <Area type="monotone" dataKey="revenue"  stroke="#0E5A55" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice status donut */}
        <div className="bg-paper rounded-2xl border border-border p-5">
          <h3 className="font-heading font-semibold text-ink mb-4">Invoice Status</h3>
          {invoiceStatusData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-ink-soft text-sm">
              No invoice data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={invoiceStatusData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3}
                >
                  {invoiceStatusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#FFFDF8', border: '1px solid #EADFCB', borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent payments */}
        <div className="bg-paper rounded-2xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-heading font-semibold text-ink">Recent Payments</h3>
            <Button variant="ghost" size="sm" icon={Zap} onClick={() => navigate('/admin/payments')}>View all</Button>
          </div>
          {recentPayments.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-soft">No payments recorded yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.customerName} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-ink">{p.customerName}</p>
                      <p className="text-xs text-ink-soft">{p.invoiceNumber} · {formatDate(p.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-forest">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-ink-soft">{p.method}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue invoices */}
        <div className="bg-paper rounded-2xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-heading font-semibold text-ink">Overdue Invoices</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/overdue')}>View all</Button>
          </div>
          {overdueInvoices.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-soft">No overdue invoices. All accounts are up to date!</div>
          ) : (
            <div className="divide-y divide-border">
              {overdueInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{inv.customerName}</p>
                    <p className="text-xs text-ink-soft">{inv.number} · Due {formatDate(inv.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-coral">{formatCurrency(inv.total)}</p>
                    <StatusBadge status="overdue" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
