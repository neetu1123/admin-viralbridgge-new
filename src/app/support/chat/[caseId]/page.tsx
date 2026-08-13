'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SupportChatRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params?.caseId as string;

  useEffect(() => {
    if (caseId) {
      router.replace(`/support/case/${caseId}`);
    }
  }, [caseId, router]);

  return null;
}
