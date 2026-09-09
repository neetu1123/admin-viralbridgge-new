'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Bell } from 'lucide-react';
import AppLogo from './ui/AppLogo';
import { useUnreadCount } from './NotificationsPanel';
import { brandApi, creatorApi } from '@/src/lib/api';

interface MobileTopBarProps {
  role: 'creator' | 'brand' | 'admin';
  onMenuClick: () => void;
}

export default function MobileTopBar({ role, onMenuClick }: MobileTopBarProps) {
  const notificationsHref = role === 'brand' ? '/brand-notifications' : '/creator-notifications';
  const unread = useUnreadCount(role === 'brand' ? brandApi : creatorApi, role === 'brand' || role === 'creator');

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 h-14 lg:hidden flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={20} className="text-slate-700" />
        </button>
        <div className="min-w-0 flex items-center">
          <AppLogo size={110} />
        </div>
      </div>

      {role !== 'admin' && (
        <Link
          href={notificationsHref}
          className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} className="text-slate-600" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-violet-600 text-white text-[10px] font-bold leading-4 text-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
      )}
    </header>
  );
}
