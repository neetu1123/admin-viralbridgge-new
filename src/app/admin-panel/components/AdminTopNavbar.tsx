'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, ChevronDown, Zap, UserPlus, AlertTriangle, ShieldCheck, DollarSign, Flag, Plus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { adminApi } from '@/src/lib/api';

const pageTitles: Record<string, string> = {
  '/admin-panel': 'Dashboard',
  '/admin-panel/users': 'Users',
  '/admin-panel/kyc': 'KYC Verification',
  '/admin-panel/campaigns': 'Campaigns',
  '/admin-panel/transactions': 'Transactions',
  '/admin-panel/escrow': 'Escrow',
  '/admin-panel/payouts': 'Payouts',
  '/admin-panel/flagged': 'Flagged Content',
  '/admin-panel/disputes': 'Disputes',
  '/admin-panel/notifications': 'Notifications',
  '/admin-panel/settings': 'Settings',
  '/admin-panel/roles': 'Admin Roles',
  '/admin-panel/audit-logs': 'Audit Logs',
  '/crm': 'CRM',
};

const quickActions = [
  { label: 'Approve KYC', icon: ShieldCheck, color: 'text-emerald-700', href: '/admin-panel/kyc?status=PENDING' },
  { label: 'Approve Withdrawals', icon: DollarSign, color: 'text-blue-700', href: '/admin-panel/payouts?status=PENDING' },
  { label: 'Review Disputes', icon: AlertTriangle, color: 'text-amber-700', href: '/admin-panel/disputes?status=OPEN' },
  { label: 'Moderate Campaigns', icon: Flag, color: 'text-red-700', href: '/admin-panel/campaigns?status=FLAGGED' },
  { label: 'Invite Admin', icon: UserPlus, color: 'text-violet-700', action: 'invite_admin' as const },
  { label: 'Create Campaign for Brand', icon: Plus, color: 'text-indigo-700', href: '/admin-panel/campaigns?create=1' },
];

export default function AdminTopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageTitle = pathname === '/crm/new'
    ? 'Add New Lead'
    : pathname.endsWith('/edit')
      ? 'Edit Lead'
      : pathname.startsWith('/crm/')
        ? 'Lead Details'
        : pageTitles[pathname] ?? 'Admin Panel';

  const loadUnread = useCallback(async () => {
    try {
      const res = await adminApi.getUnreadNotificationCount();
      setNotifCount(res.count);
    } catch {
      setNotifCount(0);
    }
  }, []);

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 60000);
    return () => clearInterval(interval);
  }, [loadUnread, pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowQuickActions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickAction = async (action: typeof quickActions[number]) => {
    setShowQuickActions(false);
    if ('href' in action && action.href) {
      router.push(action.href);
      return;
    }
    if (action.action === 'invite_admin') {
      router.push('/admin-panel/roles');
      toast.info('Use the Roles page to invite or assign an admin.');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Admin Dashboard</p>
            <h1 className="text-base font-bold text-slate-800 leading-tight">{pageTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Platform Live
          </div>

          <Link href="/admin-panel/notifications" className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Bell size={18} className="text-slate-600" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Zap size={14} />
              <span className="hidden sm:inline">Quick Actions</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${showQuickActions ? 'rotate-180' : ''}`} />
            </button>

            {showQuickActions && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quick Actions</p>
                </div>
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <Icon size={15} className={action.color} />
                      <span className="text-sm text-slate-700">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
