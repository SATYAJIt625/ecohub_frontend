'use client';

import { useState, useEffect } from 'react';
import { reportsAPI } from '@/lib/api';
import { formatCurrency, getMonthName, capitalize, CATEGORY_COLORS } from '@/lib/utils';
import { Alert } from '@/components/ui';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-surface-200 rounded-lg shadow-elevated p-3 text-xs min-w-32">
      <p className="font-semibold text-surface-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5" style={{ color: p.color }}>
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-medium text-surface-900">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── Custom Pie Label ──────────────────────────────────────────────────────────
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ReportsPage() {
  const now = new Date();
  const [summary, setSummary]       = useState(null);
  const [catData, setCatData]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [month, setMonth]           = useState(now.getMonth() + 1);
  const [year, setYear]             = useState(now.getFullYear());
  const [error, setError]           = useState('');

  useEffect(() => {
    reportsAPI.getSummary()
      .then(({ data }) => setSummary(data.data))
      .catch(() => setError('Failed to load summary.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCatLoading(true);
    reportsAPI.getCategory({ month, year })
      .then(({ data }) => setCatData(data.data))
      .catch(() => setError('Failed to load category data.'))
      .finally(() => setCatLoading(false));
  }, [month, year]);

  // Build monthly trend chart data
  const buildMonthlyData = (trend = []) => {
    const map = {};
    trend.forEach(({ _id, total }) => {
      const key = `${_id.year}-${String(_id.month).padStart(2,'0')}`;
      if (!map[key]) map[key] = { label: `${MONTH_NAMES[_id.month - 1]} ${_id.year}`, income: 0, expense: 0, net: 0 };
      if (_id.type === 'income')  map[key].income  = total;
      if (_id.type === 'expense') map[key].expense = total;
    });
    return Object.values(map).map((d) => ({ ...d, net: d.income - d.expense })).slice(-12);
  };

  // Build pie data from category breakdown
  const buildPieData = (breakdown = []) => {
    const map = {};
    breakdown.forEach(({ _id, total }) => {
      if (!map[_id.category]) map[_id.category] = { name: capitalize(_id.category), income: 0, expense: 0 };
      if (_id.type === 'income')  map[_id.category].income  = total;
      if (_id.type === 'expense') map[_id.category].expense = total;
    });
    return Object.entries(map)
      .map(([cat, vals]) => ({ ...vals, category: cat, total: vals.income + vals.expense }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  };

  const monthlyData  = buildMonthlyData(summary?.monthlyTrend);
  const allPieData   = buildPieData(catData?.categoryBreakdown);
  const expensePie   = allPieData.filter((d) => d.expense > 0).map((d) => ({ name: d.name, value: d.expense, category: d.category }));
  const incomePie    = allPieData.filter((d) => d.income  > 0).map((d) => ({ name: d.name, value: d.income,  category: d.category }));

  const catBarData = allPieData.map((d) => ({
    name: d.name, income: d.income, expense: d.expense,
  }));

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card skeleton h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {error && <Alert type="error">{error}</Alert>}

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Net Balance', value: summary?.allTime?.balance || 0, icon: DollarSign, color: 'text-brand-700', bg: 'bg-brand-50' },
          { label: 'Total Income', value: summary?.allTime?.income || 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Expenses', value: summary?.allTime?.expenses || 0, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Transactions', value: summary?.stats?.transactionCount || 0, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50', isCurrency: false },
        ].map(({ label, value, icon: Icon, color, bg, isCurrency = true }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-surface-500">{label}</p>
              <p className={`text-base font-bold ${color}`}>{isCurrency ? formatCurrency(value) : value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 12-Month Trend */}
      <div className="card p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-surface-900">12-Month Financial Trend</h3>
          <p className="text-xs text-surface-400 mt-0.5">Income, expenses, and net balance over time</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => v.split(' ')[0]} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Line type="monotone" dataKey="income"  name="Income"   stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="expense" name="Expenses" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="net"     name="Net"      stroke="#6366f1" strokeWidth={2} strokeDasharray="5 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Month Selector + Bar Chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-surface-900">Category Breakdown</h3>
            <p className="text-xs text-surface-400 mt-0.5">Income vs Expenses by category</p>
          </div>
          <div className="flex gap-2">
            <select
              className="input w-32 text-sm"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select
              className="input w-24 text-sm"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        {catLoading ? (
          <div className="skeleton h-52 rounded-lg" />
        ) : catBarData.length === 0 ? (
          <p className="text-center py-12 text-sm text-surface-400">No data for this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catBarData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="income"  name="Income"   fill="#22c55e" radius={[3,3,0,0]} />
              <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { title: 'Expense Distribution', data: expensePie, color: 'text-red-600' },
          { title: 'Income Distribution',  data: incomePie,  color: 'text-emerald-600' },
        ].map(({ title, data, color }) => (
          <div key={title} className="card p-5">
            <h3 className="text-sm font-semibold text-surface-900 mb-4">{title}</h3>
            {catLoading ? (
              <div className="skeleton h-52 rounded-lg" />
            ) : data.length === 0 ? (
              <p className="text-center py-12 text-sm text-surface-400">No data for this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="40%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    labelLine={false}
                    label={PieLabel}
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[entry.category] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [formatCurrency(value), name]}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, lineHeight: '22px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        ))}
      </div>

      {/* Category Table */}
      {catData?.categoryBreakdown?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100">
            <h3 className="text-sm font-semibold text-surface-900">Category Details — {getMonthName(month)} {year}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-100">
                  {['Category', 'Type', 'Amount', 'Transactions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {catData.categoryBreakdown.map(({ _id, total, count }) => (
                  <tr key={`${_id.category}-${_id.type}`} className="hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-3 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: CATEGORY_COLORS[_id.category] || '#94a3b8' }}
                      />
                      {capitalize(_id.category)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                        _id.type === 'income' ? 'badge-income' : 'badge-expense'
                      }`}>{_id.type}</span>
                    </td>
                    <td className={`px-5 py-3 font-semibold ${_id.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {formatCurrency(total)}
                    </td>
                    <td className="px-5 py-3 text-surface-500">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
