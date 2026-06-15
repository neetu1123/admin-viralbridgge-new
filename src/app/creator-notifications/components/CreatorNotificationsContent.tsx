'use client';
import React from 'react';
import { Toaster } from 'sonner';
import { creatorApi } from '@/src/lib/api';
import NotificationsPanel from '@/src/components/NotificationsPanel';

export default function CreatorNotificationsContent() {
  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />
      <NotificationsPanel
        api={creatorApi}
        subtitle="Campaign invites, payment updates, messages, and alerts"
      />
    </div>
  );
}
