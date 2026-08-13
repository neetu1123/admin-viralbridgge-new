'use client';

import { Suspense } from 'react';
import AppLayout from '@/src/components/AppLayout';
import { getCurrentUser } from '@/src/lib/useAuth';
import SupportNewCaseContent from '../../components/SupportNewCaseContent';
import { Loader2 } from 'lucide-react';

function useSupportRole(): 'brand' | 'creator' {
  const user = getCurrentUser();
  return (user?.role ?? 'creator').toLowerCase().includes('brand') ? 'brand' : 'creator';
}

export default function SupportNewCasePage() {
  return (
    <AppLayout role={useSupportRole()}>
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={32} /></div>}>
        <SupportNewCaseContent />
      </Suspense>
    </AppLayout>
  );
}
