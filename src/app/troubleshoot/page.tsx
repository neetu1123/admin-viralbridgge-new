'use client';

import AppLayout from '@/src/components/AppLayout';
import TroubleshootContent from './components/TroubleshootContent';
import { getCurrentUser } from '@/src/lib/useAuth';

export default function TroubleshootPage() {
  const user = getCurrentUser();
  const roleName = (user?.role ?? 'creator').toLowerCase();
  const role = roleName.includes('brand') ? 'brand' : 'creator';

  return (
    <AppLayout role={role}>
      <TroubleshootContent />
    </AppLayout>
  );
}
