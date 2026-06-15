'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, Briefcase, DollarSign, MessageSquare, ShieldCheck, AlertCircle, Check, Loader2 } from 'lucide-react';
import type { NotificationItem } from '@/src/lib/api';
import { getNotificationSocket } from '@/src/lib/socket';
import { useNotifications, type NotificationApi } from '@/src/hooks/useNotifications';

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  CAMPAIGN: { icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50' },
  APPLICATION: { icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50' },
  PAYMENT: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  WITHDRAWAL: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  MESSAGE: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
  KYC: { icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
  DISPUTE: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  SYSTEM: { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-50' },
};

function formatTime(iso: string) {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString();
}

interface NotificationsPanelProps {
  api: NotificationApi;
  subtitle: string;
}

export default function NotificationsPanel({ api, subtitle }: NotificationsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { items, unreadCount, loading, load, markRead, markAllRead } = useNotifications(api);

  useEffect(() => {
    void load(filter === 'unread');
  }, [filter, load]);

  const displayed = filter === 'unread' ? items.filter((n) => !n.is_read) : items;

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id);
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium border border-violet-200 px-3 py-2 rounded-lg hover:bg-violet-50 transition-colors"
          >
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 mb-5 bg-slate-100 rounded-xl p-1 w-fit">
        {(['all', 'unread'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 capitalize ${
              filter === tab ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
            {tab === 'unread' && unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full inline-flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-violet-600" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
          <Bell size={36} className="text-slate-300 mb-3" />
          <h3 className="text-slate-700 font-semibold mb-1">All caught up!</h3>
          <p className="text-slate-400 text-sm">No {filter === 'unread' ? 'unread ' : ''}notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((notif) => {
            const config = typeConfig[notif.type] ?? typeConfig.SYSTEM;
            const Icon = config.icon;
            return (
              <div
                key={notif.id}
                className={`bg-white rounded-xl border p-4 transition-all ${
                  !notif.is_read ? 'border-violet-200 ring-1 ring-violet-50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <Icon size={16} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-semibold ${!notif.is_read ? 'text-slate-800' : 'text-slate-600'}`}>
                          {notif.title}
                        </p>
                        {!notif.is_read && <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />}
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{formatTime(notif.created_at)}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">{notif.message}</p>
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export function useUnreadCount(api: Pick<NotificationApi, 'getUnreadNotificationCount'>, enabled = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const refresh = async () => {
      try {
        const res = await api.getUnreadNotificationCount();
        setCount(res.count);
      } catch {
        setCount(0);
      }
    };

    void refresh();
    const socket = getNotificationSocket();
    const onNew = () => setCount((c) => c + 1);
    socket?.on('notification:new', onNew);
    const interval = setInterval(refresh, 60000);

    return () => {
      socket?.off('notification:new', onNew);
      clearInterval(interval);
    };
  }, [api, enabled]);

  return count;
}
