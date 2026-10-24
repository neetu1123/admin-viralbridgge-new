'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Mail, Sparkles, X } from 'lucide-react';
import type { NotificationItem } from '@/src/lib/api';
import { adminApi, brandApi, creatorApi } from '@/src/lib/api';
import { getNotificationSocket } from '@/src/lib/socket';
import {
  getNotificationActionLabel,
  getNotificationActionUrl,
  isApproachNotification,
  isRejectionNotification,
  type NotificationRole,
} from '@/src/lib/notificationNavigation';

interface ApproachBannerProps {
  role: NotificationRole;
}

function apiForRole(role: NotificationRole) {
  if (role === 'brand') return brandApi;
  if (role === 'admin') return adminApi;
  return creatorApi;
}

export default function ApproachBanner({ role }: ApproachBannerProps) {
  const router = useRouter();
  const [queue, setQueue] = useState<NotificationItem[]>([]);
  const [leaving, setLeaving] = useState(false);
  const current = queue[0] ?? null;

  const load = useCallback(async () => {
    try {
      const res = await apiForRole(role).getBannerNotifications();
      setQueue(res.data ?? []);
    } catch {
      // Banner is non-blocking
    }
  }, [role]);

  useEffect(() => {
    void load();
    const socket = getNotificationSocket();
    const onNew = (notification: NotificationItem) => {
      if (!isApproachNotification(notification) && !isRejectionNotification(notification)) return;
      setQueue((prev) => [notification, ...prev.filter((n) => n.id !== notification.id)]);
    };
    socket?.on('notification:new', onNew);
    return () => {
      socket?.off('notification:new', onNew);
    };
  }, [load]);

  const removeCurrent = () => {
    setLeaving(true);
    window.setTimeout(() => {
      setQueue((prev) => prev.slice(1));
      setLeaving(false);
    }, 220);
  };

  const handleDismiss = async () => {
    if (!current) return;
    const id = current.id;
    removeCurrent();
    try {
      await apiForRole(role).dismissNotification(id);
    } catch {
      // Keep UX snappy even if the request fails
    }
  };

  const handleAction = async () => {
    if (!current) return;
    const url = getNotificationActionUrl(current, role);
    const id = current.id;
    removeCurrent();
    try {
      await apiForRole(role).markNotificationRead(id);
    } catch {
      // Navigation still proceeds
    }
    if (url) router.push(url);
  };

  if (!current) return null;

  const isInvite = current.type === 'CAMPAIGN_INVITE' || current.title.toLowerCase().includes('invit');
  const isRejection = isRejectionNotification(current);
  const actionLabel = getNotificationActionLabel(current, role) || (isRejection ? 'See why' : isInvite ? 'View Invitation' : 'Review');

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[90] flex justify-center px-3 sm:top-4 lg:top-5">
      <div
        className={`pointer-events-auto w-full max-w-xl rounded-2xl border bg-white/95 shadow-xl backdrop-blur-md transition-all duration-200 ${
          isRejection ? 'border-red-200 shadow-red-200/40' : 'border-violet-200 shadow-violet-200/40'
        } ${leaving ? '-translate-y-3 opacity-0' : 'translate-y-0 opacity-100'}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3 px-4 py-3.5">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white ${
            isRejection ? 'bg-red-600' : 'bg-gradient-to-br from-violet-600 to-fuchsia-500'
          }`}>
            {isRejection ? <AlertCircle size={18} /> : isInvite ? <Mail size={18} /> : <Sparkles size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${isRejection ? 'text-red-600' : 'text-violet-600'}`}>
              {isRejection ? 'Account update' : isInvite ? 'New invitation' : 'New approach'}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">{current.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{current.message}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAction}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors ${
                  isRejection ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'
                }`}
              >
                {actionLabel}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
