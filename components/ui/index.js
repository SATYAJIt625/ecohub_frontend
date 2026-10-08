'use client';

import { forwardRef } from 'react';
import { Loader2, X } from 'lucide-react';
import clsx from 'clsx';

// ─── Button ──────────────────────────────────────────────────────────────────
export function Button({ variant = 'primary', size = 'md', loading, children, className, ...props }) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:   'bg-brand-600 hover:bg-brand-700 text-white shadow-sm',
    secondary: 'bg-white hover:bg-surface-50 text-surface-700 border border-surface-200',
    danger:    'bg-red-600 hover:bg-red-700 text-white',
    ghost:     'text-surface-600 hover:text-surface-900 hover:bg-surface-100',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = forwardRef(({ label, error, className, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="label">{label}</label>}
    <input ref={ref} className={clsx('input', error && 'border-red-400 focus:ring-red-400', className)} {...props} />
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
));
Input.displayName = 'Input';

// ─── Select ───────────────────────────────────────────────────────────────────
export const Select = forwardRef(({ label, error, children, className, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="label">{label}</label>}
    <select ref={ref} className={clsx('input', error && 'border-red-400', className)} {...props}>
      {children}
    </select>
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
));
Select.displayName = 'Select';

// ─── Textarea ─────────────────────────────────────────────────────────────────
export const Textarea = forwardRef(({ label, error, className, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="label">{label}</label>}
    <textarea ref={ref} rows={3} className={clsx('input resize-none', error && 'border-red-400', className)} {...props} />
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative bg-white rounded-xl shadow-elevated w-full animate-slide-up', widths[size])}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h2 className="text-base font-semibold text-surface-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'gray' }) {
  const colors = {
    green:  'bg-emerald-50 text-emerald-700',
    red:    'bg-red-50 text-red-700',
    blue:   'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    gray:   'bg-surface-100 text-surface-600',
    yellow: 'bg-amber-50 text-amber-700',
    orange: 'bg-orange-50 text-orange-700',
  };
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colors[color])}>
      {children}
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-surface-400" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-surface-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-surface-500 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────
export function Alert({ type = 'info', children }) {
  const styles = {
    info:    'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error:   'bg-red-50 border-red-200 text-red-800',
  };
  return (
    <div className={clsx('px-4 py-3 rounded-lg border text-sm', styles[type])}>
      {children}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ title, value, icon: Icon, iconBg = 'bg-brand-50', iconColor = 'text-brand-600', trend, trendUp }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className={clsx('w-5 h-5', iconColor)} />
        </div>
        {trend !== undefined && (
          <span className={clsx('text-xs font-medium', trendUp ? 'text-emerald-600' : 'text-red-500')}>
            {trendUp ? '+' : ''}{trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-surface-500 font-medium uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-surface-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner({ className }) {
  return <Loader2 className={clsx('w-5 h-5 animate-spin text-brand-600', className)} />;
}
