'use client';

import { useState, useEffect, useCallback } from 'react';
import { transactionsAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatCurrency, formatDate, capitalize } from '@/lib/utils';
import { Button, Modal, EmptyState, Alert, Badge, StatCard } from '@/components/ui';
import {
  Plus, Search, Filter, Trash2, Pencil,
  ArrowUpRight, ArrowDownRight, ArrowLeftRight,
  ChevronLeft, ChevronRight, Wallet, TrendingUp, TrendingDown,
} from 'lucide-react';

const CATEGORIES = [
  '','food','events','maintenance','equipment','travel',
  'utilities','salaries','marketing','donations','membership','grants','sponsorship','other',
];

// ── Lazy-load the modal to avoid SSR issues ───────────────────────────────────
import dynamic from 'next/dynamic';
const TransactionModal = dynamic(() => import('@/components/ui/TransactionModal'), { ssr: false });

const categoryColor = {
  food: 'yellow', events: 'purple', maintenance: 'gray', equipment: 'blue',
  travel: 'orange', utilities: 'purple', salaries: 'gray', marketing: 'blue',
  donations: 'green', membership: 'green', grants: 'blue', sponsorship: 'purple', other: 'gray',
};

export default function TransactionsPage() {
  const { canEdit, isAdmin } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary]           = useState({ income: 0, expenses: 0, balance: 0 });
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  // Filters
  const [search, setSearch]       = useState('');
  const [typeFilter, setType]     = useState('');
  const [catFilter, setCat]       = useState('');
  const [startDate, setStart]     = useState('');
  const [endDate, setEnd]         = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);

  // Modals
  const [showAdd, setShowAdd]         = useState(false);
  const [editTx, setEditTx]           = useState(null);
  const [deleteTx, setDeleteTx]       = useState(null);
  const [deleting, setDeleting]       = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search)     params.search    = search;
      if (typeFilter) params.type      = typeFilter;
      if (catFilter)  params.category  = catFilter;
      if (startDate)  params.startDate = startDate;
      if (endDate)    params.endDate   = endDate;

      const { data } = await transactionsAPI.getAll(params);
      setTransactions(data.transactions);
      setSummary(data.summary);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch {
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, catFilter, startDate, endDate, page]);

  useEffect(() => {
    const t = setTimeout(fetchTransactions, 300);
    return () => clearTimeout(t);
  }, [fetchTransactions]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await transactionsAPI.delete(deleteTx._id);
      setDeleteTx(null);
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearch(''); setType(''); setCat('');
    setStart(''); setEnd(''); setPage(1);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Transactions</h2>
          <p className="page-subtitle">{total} total records</p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> Add Transaction
          </Button>
        )}
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Balance"  value={formatCurrency(summary.balance)}  icon={Wallet}      iconBg="bg-brand-50"   iconColor="text-brand-600" />
        <StatCard title="Income"   value={formatCurrency(summary.income)}   icon={TrendingUp}  iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Expenses" value={formatCurrency(summary.expenses)} icon={TrendingDown} iconBg="bg-red-50"    iconColor="text-red-500" />
      </div>

      {/* Filters bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input className="input pl-9" placeholder="Search transactions…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input w-36" value={typeFilter}
            onChange={(e) => { setType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select className="input w-40 capitalize" value={catFilter}
            onChange={(e) => { setCat(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {CATEGORIES.filter(Boolean).map((c) => (
              <option key={c} value={c} className="capitalize">{capitalize(c)}</option>
            ))}
          </select>
          <input type="date" className="input w-38" value={startDate}
            onChange={(e) => { setStart(e.target.value); setPage(1); }} />
          <input type="date" className="input w-38" value={endDate}
            onChange={(e) => { setEnd(e.target.value); setPage(1); }} />
          <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                {['Transaction', 'Category', 'Type', 'Date', 'Amount', ...(canEdit ? ['Actions'] : [])].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(canEdit ? 6 : 5)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5}>
                    <EmptyState
                      icon={ArrowLeftRight}
                      title="No transactions found"
                      description="Try adjusting your filters or add a new transaction."
                      action={canEdit && (
                        <Button onClick={() => setShowAdd(true)}>
                          <Plus className="w-4 h-4" /> Add Transaction
                        </Button>
                      )}
                    />
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          tx.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'
                        }`}>
                          {tx.type === 'income'
                            ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                            : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 truncate max-w-xs">{tx.title}</p>
                          {tx.description && (
                            <p className="text-xs text-surface-400 truncate max-w-xs">{tx.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge color={categoryColor[tx.category] || 'gray'}>{capitalize(tx.category)}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${
                        tx.type === 'income' ? 'badge-income' : 'badge-expense'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-surface-500 whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className={`px-5 py-3.5 font-semibold whitespace-nowrap ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    {canEdit && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditTx(tx)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" size="sm"
                              className="hover:text-red-500 hover:bg-red-50"
                              onClick={() => setDeleteTx(tx)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-surface-100 bg-surface-50">
            <p className="text-xs text-surface-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <TransactionModal onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); fetchTransactions(); }} />
      )}

      {/* Edit Modal */}
      {editTx && (
        <TransactionModal transaction={editTx} onClose={() => setEditTx(null)} onSave={() => { setEditTx(null); fetchTransactions(); }} />
      )}

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTx} onClose={() => setDeleteTx(null)} title="Delete Transaction" size="sm">
        <p className="text-sm text-surface-600 mb-2">
          Are you sure you want to delete <strong>"{deleteTx?.title}"</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" onClick={() => setDeleteTx(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
