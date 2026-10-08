'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

const pageTitles = {
  '/dashboard':    { title: 'Dashboard',    subtitle: 'Overview of your organization finances' },
  '/members':      { title: 'Members',      subtitle: 'Manage team members and roles' },
  '/transactions': { title: 'Transactions', subtitle: 'Track income and expenses' },
  '/budget':       { title: 'Budget',       subtitle: 'Plan and monitor monthly budgets' },
  '/reports':      { title: 'Reports',      subtitle: 'Analytics and financial insights' },
};

export default function Topbar() {
  const pathname = usePathname();
  const match    = Object.entries(pageTitles).find(([key]) => pathname.startsWith(key));
  const info     = match?.[1] || { title: 'EcoHub', subtitle: '' };

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-surface-900">{info.title}</h1>
        {info.subtitle && (
          <p className="text-xs text-surface-400 mt-0.5">{info.subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
