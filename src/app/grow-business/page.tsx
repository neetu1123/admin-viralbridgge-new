'use client';

import AppLayout from '@/src/components/AppLayout';
import GrowBusinessContent from './components/GrowBusinessContent';
import { useAuth } from '@/src/lib/useAuth';

export default function GrowBusinessPage() {
  const { user, loading } = useAuth();
  const role = (user?.role || '').toLowerCase();
  const layoutRole = role.includes('brand') ? 'brand' : role.includes('admin') ? 'admin' : 'creator';

  if (loading) return null;

  return (
    <AppLayout role={layoutRole}>
      <GrowBusinessContent />
    </AppLayout>
  );
}
