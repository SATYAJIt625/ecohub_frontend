import { AuthProvider } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
