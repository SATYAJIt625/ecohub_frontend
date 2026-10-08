'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getInitials, roleBadgeClass, capitalize } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  LogOut,
  Leaf,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/members',       label: 'Members',      icon: Users,            adminOnly: false },
  { href: '/transactions',  label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budget',        label: 'Budget',       icon: PiggyBank },
  { href: '/reports',       label: 'Reports',      icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-surface-200 flex flex-col z-30">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-surface-100">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-surface-900 tracking-tight">EcoHub</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest px-3 mb-2 mt-2">
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-surface-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-brand-700">{getInitials(user?.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-900 truncate">{user?.name}</p>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${roleBadgeClass[user?.role]}`}>
              {capitalize(user?.role)}
            </span>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 rounded-md text-surface-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
