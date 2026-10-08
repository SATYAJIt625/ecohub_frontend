import { AuthProvider } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';

export default function TransactionsLayout({ children }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
