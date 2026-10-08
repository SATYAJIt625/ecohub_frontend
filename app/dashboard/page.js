'use client';

import { useState, useEffect } from 'react';
import { reportsAPI, transactionsAPI } from '@/lib/api';
import { formatCurrency, formatDate, CATEGORY_COLORS } from '@/lib/utils';
import { StatCard } from '@/components/ui';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Wallet, TrendingUp, TrendingDown, Users,
  ArrowUpRight, ArrowDownRight, Activity,
} from 'lucide-react';

// ─── Month label helper ───────────────────────────────────────────────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildMonthlyChartData(trend) {
  const map = {};
  trend.forEach(({ _id, total }) => {
    const key = `${_id.year}-${String(_id.month).padStart(2,'0')}`;
    if (!map[key]) map[key] = { label: `${MONTH_NAMES[_id.month - 1]} ${_id.year}`, income: 0, expense: 0 };
    if (_id.type === 'income')  map[key].income  = total;
    if (_id.type === 'expense') map[key].expense = total;
  });
  return Object.values(map).slice(-6);
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-surface-200 rounded-lg shadow-elevated p-3 text-xs">
      <p className="font-semibold text-surface-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    reportsAPI.getSummary()
      .then(({ data }) => setSummary(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-10 w-10 rounded-lg" />
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-7 w-32 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5 lg:col-span-2 skeleton h-72" />
          <div className="card p-5 skeleton h-72" />
        </div>
      </div>
    );
  }

  const { allTime, thisMonth, monthlyTrend = [], recentTransactions = [], stats } = summary || {};
  const chartData   = buildMonthlyChartData(monthlyTrend);

  // Build pie data from recent monthly trend
  const categoryMap = {};
  (monthlyTrend || []).forEach(({ _id, total }) => {
    if (_id.type === 'expense') {
      categoryMap[_id.type] = (categoryMap[_id.type] || 0) + total;
    }
  });

  const pieData = chartData.map((d) => ({ name: d.label, value: d.expense })).filter((d) => d.value > 0).slice(-5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(allTime?.balance || 0)}
          icon={Wallet}
          iconBg="bg-brand-50"
          iconColor="text-brand-600"
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(allTime?.income || 0)}
          icon={TrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(allTime?.expenses || 0)}
          icon={TrendingDown}
          iconBg="bg-red-50"
          iconColor="text-red-500"
        />
        <StatCard
          title="Active Members"
          value={stats?.memberCount || 0}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      {/* ── This Month Banner ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'This Month Income',   value: thisMonth?.income   || 0, color: 'text-emerald-600', Icon: ArrowUpRight,   bg: 'bg-emerald-50' },
          { label: 'This Month Expenses', value: thisMonth?.expenses || 0, color: 'text-red-500',     Icon: ArrowDownRight, bg: 'bg-red-50' },
          { label: 'This Month Balance',  value: thisMonth?.balance  || 0, color: 'text-brand-700',   Icon: Activity,       bg: 'bg-brand-50' },
        ].map(({ label, value, color, Icon, bg }) => (
          <div key={label} className="card p-4 flex items-center gap-4">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-surface-500">{label}</p>
              <p className={`text-lg font-bold ${color}`}>{formatCurrency(value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart — Monthly Trend */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-surface-900">Financial Overview</h3>
              <p className="text-xs text-surface-400 mt-0.5">Last 6 months income vs expenses</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="income"  name="Income"   stroke="#22c55e" strokeWidth={2} fill="url(#incomeGrad)"  dot={{ r: 3 }} />
              <Area type="monotone" dataKey="expense" name="Expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart — Monthly Comparison */}
        <div className="card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-surface-900">Monthly Bars</h3>
            <p className="text-xs text-surface-400 mt-0.5">Income vs Expense per month</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v.split(' ')[0]} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="income"  name="Income"   fill="#22c55e" radius={[3,3,0,0]} />
              <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h3 className="text-sm font-semibold text-surface-900">Recent Transactions</h3>
          <a href="/transactions" className="text-xs text-brand-600 hover:underline font-medium">View all →</a>
        </div>
        <div className="divide-y divide-surface-50">
          {recentTransactions.length === 0 ? (
            <p className="text-center py-10 text-sm text-surface-400">No transactions yet.</p>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  tx.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  {tx.type === 'income'
                    ? <ArrowUpRight   className="w-4 h-4 text-emerald-600" />
                    : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{tx.title}</p>
                  <p className="text-xs text-surface-400">{tx.category} · {formatDate(tx.date)}</p>
                </div>
                <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
