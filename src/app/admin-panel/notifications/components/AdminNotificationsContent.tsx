'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';
import { adminApi, type NotificationItem } from '@/src/lib/api';

export default function AdminNotificationsContent() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getNotifications({ limit: 50 });
      setItems(res.data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load notifications');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: string) => {
    try {
      await adminApi.markNotificationRead(id);
      setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await adminApi.markAllNotificationsRead();
      setItems(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Platform alerts and system notifications</p>
        </div>
        <button onClick={markAllRead} className="text-xs font-medium text-violet-600 hover:text-violet-800 border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50">
          Mark all read
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-violet-600" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">No notifications yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map(n => (
            <button
              key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              className={`w-full text-left bg-white rounded-xl border p-4 flex items-start gap-3 transition-colors ${n.is_read ? 'border-slate-200 opacity-70' : 'border-violet-200 hover:bg-violet-50/30'}`}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-slate-300' : 'bg-violet-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{n.type} · {n.created_at?.slice(0, 16).replace('T', ' ')}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
