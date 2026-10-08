'use client';

import { useState, useEffect, useCallback } from 'react';
import { budgetsAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatCurrency, getMonthName, capitalize } from '@/lib/utils';
import { Button, Modal, Input, Select, Textarea, Alert, EmptyState, Badge } from '@/components/ui';
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle, PiggyBank, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  'food','events','maintenance','equipment','travel',
  'utilities','salaries','marketing','donations','membership','grants','sponsorship','other',
];

const defaultForm = { name: '', category: 'events', plannedAmount: '', notes: '', alertThreshold: 80 };

function BudgetModal({ budget, month, year, onClose, onSave }) {
  const isEdit = !!budget;
  const [form, setForm]       = useState(budget ? {
    name: budget.name, category: budget.category,
    plannedAmount: budget.plannedAmount, notes: budget.notes || '',
    alertThreshold: budget.alertThreshold || 80,
  } : defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, plannedAmount: parseFloat(form.plannedAmount), month, year, alertThreshold: parseInt(form.alertThreshold) };
      if (isEdit) await budgetsAPI.update(budget._id, payload);
      else        await budgetsAPI.create(payload);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? 'Edit Budget' : 'New Budget'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        <Input label="Budget Name *" name="name" value={form.name} onChange={handleChange}
          placeholder="e.g. Events Budget" required />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className="input">
              {CATEGORIES.map((c) => <option key={c} value={c}>{capitalize(c)}</option>)}
            </select>
          </div>
          <Input label="Planned Amount (₹) *" name="plannedAmount" type="number" min="0"
            value={form.plannedAmount} onChange={handleChange} placeholder="0" required />
        </div>
        <Input label={`Alert Threshold (%)`} name="alertThreshold" type="number" min="1" max="100"
          value={form.alertThreshold} onChange={handleChange}
          placeholder="80" />
        <p className="text-xs text-surface-400 -mt-2">You'll be alerted when spending reaches this % of budget.</p>
        <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange}
          placeholder="Optional notes about this budget…" />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button loading={loading} type="submit">{isEdit ? 'Save Changes' : 'Create Budget'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function BudgetCard({ budget, onEdit, onDelete, canEdit }) {
  const { name, category, plannedAmount, actualAmount, percentage, remaining, isExceeded, isAlerted } = budget;

  const barColor = isExceeded ? 'bg-red-500' : isAlerted ? 'bg-amber-400' : 'bg-brand-500';
  const statusIcon = isExceeded
    ? <AlertTriangle className="w-4 h-4 text-red-500" />
    : isAlerted
      ? <AlertTriangle className="w-4 h-4 text-amber-500" />
      : <CheckCircle className="w-4 h-4 text-brand-500" />;

  return (
    <div className={`card p-5 space-y-4 ${isExceeded ? 'border-red-200' : isAlerted ? 'border-amber-200' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-surface-900 truncate">{name}</p>
          <span className="text-xs text-surface-500 capitalize">{category}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {statusIcon}
          {canEdit && (
            <>
              <Button variant="ghost" size="sm" onClick={() => onEdit(budget)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:text-red-500 hover:bg-red-50" onClick={() => onDelete(budget)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-surface-500">
          <span>{formatCurrency(actualAmount)} spent</span>
          <span className={`font-semibold ${isExceeded ? 'text-red-600' : 'text-surface-700'}`}>
            {Math.min(percentage, 100)}%
          </span>
        </div>
        <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="bg-surface-50 rounded-lg p-2.5 text-center">
          <p className="text-xs text-surface-500 mb-0.5">Planned</p>
          <p className="text-sm font-semibold text-surface-800">{formatCurrency(plannedAmount)}</p>
        </div>
        <div className={`rounded-lg p-2.5 text-center ${isExceeded ? 'bg-red-50' : 'bg-emerald-50'}`}>
          <p className="text-xs text-surface-500 mb-0.5">{isExceeded ? 'Over by' : 'Remaining'}</p>
          <p className={`text-sm font-semibold ${isExceeded ? 'text-red-600' : 'text-emerald-700'}`}>
            {formatCurrency(Math.abs(remaining))}
          </p>
        </div>
      </div>

      {/* Alert badge */}
      {isExceeded && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Budget exceeded!
        </div>
      )}
      {!isExceeded && isAlerted && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Approaching budget limit ({budget.alertThreshold}% threshold)
        </div>
      )}
    </div>
  );
}

export default function BudgetPage() {
  const { canEdit, isAdmin } = useAuth();
  const now = new Date();

  const [month, setMonth]       = useState(now.getMonth() + 1);
  const [year, setYear]         = useState(now.getFullYear());
  const [budgets, setBudgets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBudget, setEditBudget]   = useState(null);
  const [deleteBudget, setDeleteBudget] = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [error, setError]           = useState('');

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await budgetsAPI.getAll({ month, year });
      setBudgets(data.budgets);
    } catch {
      setError('Failed to load budgets.');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await budgetsAPI.delete(deleteBudget._id);
      setDeleteBudget(null);
      fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  // Summary
  const totalPlanned  = budgets.reduce((s, b) => s + b.plannedAmount, 0);
  const totalActual   = budgets.reduce((s, b) => s + b.actualAmount, 0);
  const exceededCount = budgets.filter((b) => b.isExceeded).length;
  const alertedCount  = budgets.filter((b) => b.isAlerted && !b.isExceeded).length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Budget Tracker</h2>
          <p className="page-subtitle">Plan and monitor monthly spending</p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> New Budget
          </Button>
        )}
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Month Selector */}
      <div className="card p-4 flex items-center justify-between">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h3 className="font-semibold text-surface-900">{getMonthName(month)} {year}</h3>
          <p className="text-xs text-surface-500">{budgets.length} budget{budgets.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-600 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Summary row */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Planned', value: formatCurrency(totalPlanned), color: 'text-surface-800' },
            { label: 'Total Spent',   value: formatCurrency(totalActual),  color: totalActual > totalPlanned ? 'text-red-600' : 'text-surface-800' },
            { label: 'Exceeded',      value: `${exceededCount} category${exceededCount !== 1 ? 's' : ''}`, color: exceededCount > 0 ? 'text-red-600' : 'text-surface-800' },
            { label: 'Near Limit',    value: `${alertedCount} category${alertedCount !== 1 ? 's' : ''}`,  color: alertedCount > 0 ? 'text-amber-600' : 'text-surface-800' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4 text-center">
              <p className="text-xs text-surface-500 mb-1">{label}</p>
              <p className={`text-lg font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Budget Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-5 w-32 rounded" />
              <div className="skeleton h-2 rounded-full" />
              <div className="grid grid-cols-2 gap-3">
                <div className="skeleton h-12 rounded-lg" />
                <div className="skeleton h-12 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={PiggyBank}
            title="No budgets for this month"
            description="Create budget targets to track your spending."
            action={canEdit && (
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4" /> Create Budget
              </Button>
            )}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <BudgetCard
              key={b._id}
              budget={b}
              canEdit={canEdit}
              onEdit={setEditBudget}
              onDelete={setDeleteBudget}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <BudgetModal month={month} year={year} onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchBudgets(); }} />
      )}

      {/* Edit Modal */}
      {editBudget && (
        <BudgetModal budget={editBudget} month={month} year={year}
          onClose={() => setEditBudget(null)}
          onSave={() => { setEditBudget(null); fetchBudgets(); }} />
      )}

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteBudget} onClose={() => setDeleteBudget(null)} title="Delete Budget" size="sm">
        <p className="text-sm text-surface-600 mb-5">
          Delete budget "<strong>{deleteBudget?.name}</strong>"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteBudget(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
