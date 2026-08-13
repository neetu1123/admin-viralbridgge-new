'use client';

import AppLayout from '@/src/components/AppLayout';
import { getCurrentUser } from '@/src/lib/useAuth';
import { SupportCaseListContent } from '../components/SupportCaseContent';

function useSupportRole(): 'brand' | 'creator' {
  const user = getCurrentUser();
  return (user?.role ?? 'creator').toLowerCase().includes('brand') ? 'brand' : 'creator';
}

export default function SupportCasesPage() {
  return (
    <AppLayout role={useSupportRole()}>
      <SupportCaseListContent />
    </AppLayout>
  );
}
