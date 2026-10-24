'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Bell, Menu, Package, Plus } from 'lucide-react';
import AppLogo from '@/src/components/ui/AppLogo';
import { useUnreadCount } from '@/src/components/NotificationsPanel';
import { brandApi } from '@/src/lib/api';

const links = [
  { label: 'Explore packages', href: '/subscription', icon: Package },
  { label: 'Performance', href: '/analytics', icon: BarChart3 },
  { label: 'Create campaign', href: '/brand-campaign-management/create', icon: Plus },
];

export default function BrandTopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const unread = useUnreadCount(brandApi, true);

  return (
    <header className="sticky top-0 z-30 flex-shrink-0 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-3 px-4 h-14">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={20} className="text-slate-700" />
        </button>
        <div className="hidden sm:flex items-center min-w-0">
          <AppLogo size={110} />
        </div>
        <nav className="flex flex-1 items-center justify-end gap-2 overflow-x-auto" aria-label="Brand actions">
          {links.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            const primary = item.label === 'Create campaign';
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                  primary
                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                    : active
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/brand-notifications"
            className="relative p-2 rounded-lg hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-slate-600" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-violet-600 text-white text-[10px] font-bold leading-4 text-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
