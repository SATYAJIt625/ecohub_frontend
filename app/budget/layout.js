import { AuthProvider } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';

export default function BudgetLayout({ children }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
