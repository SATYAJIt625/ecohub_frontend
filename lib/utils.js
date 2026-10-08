/**
 * Utility helper functions
 */

import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format a number as currency (INR by default, adjustable)
 */
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format a date to readable string
 */
export const formatDate = (date, fmt = 'MMM dd, yyyy') => {
  if (!date) return '—';
  return format(new Date(date), fmt);
};

/**
 * Format date as relative time
 */
export const formatRelative = (date) => {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Get month name from number (1-12)
 */
export const getMonthName = (month) => {
  return new Date(2024, month - 1, 1).toLocaleString('default', { month: 'long' });
};

/**
 * Get initials from a name
 */
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Capitalize first letter
 */
export const capitalize = (str = '') =>
  str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Role badge color map
 */
export const roleBadgeClass = {
  admin:     'bg-purple-50 text-purple-700',
  treasurer: 'bg-blue-50 text-blue-700',
  member:    'bg-surface-100 text-surface-600',
};

/**
 * Category color map for charts
 */
export const CATEGORY_COLORS = {
  food:        '#f59e0b',
  events:      '#6366f1',
  maintenance: '#64748b',
  equipment:   '#0ea5e9',
  travel:      '#f97316',
  utilities:   '#8b5cf6',
  salaries:    '#ec4899',
  marketing:   '#14b8a6',
  donations:   '#22c55e',
  membership:  '#84cc16',
  grants:      '#06b6d4',
  sponsorship: '#a855f7',
  other:       '#94a3b8',
};

/**
 * Build query string from params object (skip undefined/empty)
 */
export const buildParams = (obj) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  return params;
};
