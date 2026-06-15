'use client';
import React from 'react';
import { Toaster } from 'sonner';
import { brandApi } from '@/src/lib/api';
import NotificationsPanel from '@/src/components/NotificationsPanel';

export default function BrandNotificationsContent() {
  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />
      <NotificationsPanel
        api={brandApi}
        subtitle="Applicant updates, payment alerts, messages, and platform notifications"
      />
    </div>
  );
}
