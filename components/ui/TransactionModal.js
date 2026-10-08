'use client';

import { useState } from 'react';
import { transactionsAPI } from '@/lib/api';
import { Modal, Button, Input, Select, Textarea, Alert } from '@/components/ui';
import { Transaction } from '@/models/Transaction';

const CATEGORIES = [
  'food','events','maintenance','equipment','travel',
  'utilities','salaries','marketing','donations','membership','grants','sponsorship','other',
];

const defaultForm = {
  title: '', amount: '', type: 'expense', category: 'events',
  date: new Date().toISOString().split('T')[0], description: '',
};

export default function TransactionModal({ transaction, onClose, onSave }) {
  const isEdit = !!transaction;
  const [form, setForm]       = useState(transaction ? {
    ...transaction,
    amount: transaction.amount,
    date: transaction.date ? transaction.date.split('T')[0] : defaultForm.date,
  } : defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount || !form.category) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (isEdit) {
        await transactionsAPI.update(transaction._id, payload);
      } else {
        await transactionsAPI.create(payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? 'Edit Transaction' : 'New Transaction'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}

        {/* Type toggle */}
        <div className="flex rounded-lg border border-surface-200 p-1 gap-1">
          {['expense', 'income'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: t }))}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                form.type === t
                  ? t === 'income'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-500 text-white'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Input
          label="Title *"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Team Lunch"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount (₹) *"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
          <Input
            label="Date *"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="label">Category *</label>
          <select name="category" value={form.category} onChange={handleChange} className="input capitalize">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        <Textarea
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Optional notes about this transaction…"
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button loading={loading} type="submit">
            {isEdit ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
