'use client';

import AppLayout from '@/src/components/AppLayout';
import { getCurrentUser } from '@/src/lib/useAuth';
import SupportHomeContent from './components/SupportHomeContent';

function useSupportRole(): 'brand' | 'creator' {
  const user = getCurrentUser();
  const roleName = (user?.role ?? 'creator').toLowerCase();
  return roleName.includes('brand') ? 'brand' : 'creator';
}

export default function SupportPage() {
  return (
    <AppLayout role={useSupportRole()}>
      <SupportHomeContent />
    </AppLayout>
  );
}
