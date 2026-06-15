'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { NotificationItem, NotificationListResponse } from '@/src/lib/api';
import { getNotificationSocket } from '@/src/lib/socket';

export interface NotificationApi {
  getNotifications: (params?: { page?: number; limit?: number; unread?: boolean }) => Promise<NotificationListResponse>;
  getUnreadNotificationCount: () => Promise<{ count: number }>;
  markNotificationRead: (id: string) => Promise<unknown>;
  markAllNotificationsRead: () => Promise<unknown>;
}

export function useNotifications(api: NotificationApi, options?: { pollMs?: number }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const pollMs = options?.pollMs ?? 60000;
  const apiRef = useRef(api);
  apiRef.current = api;

  const refreshUnread = useCallback(async () => {
    try {
      const res = await apiRef.current.getUnreadNotificationCount();
      setUnreadCount(res.count);
    } catch {
      // ignore polling errors
    }
  }, []);

  const load = useCallback(async (unreadOnly = false) => {
    setLoading(true);
    try {
      const res = await apiRef.current.getNotifications({ limit: 50, unread: unreadOnly || undefined });
      setItems(res.data);
      setUnreadCount(res.unreadCount);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void refreshUnread();

    const socket = getNotificationSocket();
    const onNew = (notification: NotificationItem) => {
      setItems((prev) => [notification, ...prev.filter((n) => n.id !== notification.id)]);
      setUnreadCount((c) => c + 1);
    };

    socket?.on('notification:new', onNew);

    const interval = setInterval(() => {
      void refreshUnread();
    }, pollMs);

    return () => {
      socket?.off('notification:new', onNew);
      clearInterval(interval);
    };
  }, [load, refreshUnread, pollMs]);

  const markRead = useCallback(async (id: string) => {
    await apiRef.current.markNotificationRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await apiRef.current.markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  return { items, unreadCount, loading, load, markRead, markAllRead, refreshUnread };
}
