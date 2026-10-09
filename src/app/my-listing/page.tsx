'use client';

import AppLayout from '@/src/components/AppLayout';
import PortalListingContent from './components/PortalListingContent';
import { useAuth } from '@/src/lib/useAuth';

export default function PortalMyListingPage() {
  const { user, loading } = useAuth('brand');
  const role = (user?.role || '').toLowerCase();
  const layoutRole = role.includes('brand') ? 'brand' : role.includes('admin') ? 'admin' : 'creator';

  if (loading) return null;

  return (
    <AppLayout role={layoutRole}>
      <PortalListingContent />
    </AppLayout>
  );
}
