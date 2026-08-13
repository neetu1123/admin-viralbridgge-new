'use client';

import AppLayout from '@/src/components/AppLayout';
import { getCurrentUser } from '@/src/lib/useAuth';

export default function SupportLayoutShell({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  const role = (user?.role ?? 'creator').toLowerCase().includes('brand') ? 'brand' : 'creator';
  return <AppLayout role={role}>{children}</AppLayout>;
}
