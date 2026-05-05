'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Zap, RefreshCw, Plus, UserPlus, AlertTriangle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
// import Icon from '@/components/ui/AppIcon';


const pageTitles: Record<string, string> = {
  '/admin-panel': 'Dashboard',
  '/admin-panel/users': 'Users',
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
};

const quickActions = [
  { label: 'Create Campaign (Test)', icon: Plus, color: 'text-violet-700', action: 'create_campaign' },
  { label: 'Add Admin', icon: UserPlus, color: 'text-blue-700', action: 'add_admin' },
  { label: 'Resolve Alerts', icon: AlertTriangle, color: 'text-amber-700', action: 'resolve_alerts' },
  { label: 'Refresh Data', icon: RefreshCw, color: 'text-emerald-700', action: 'refresh_data' },
];

export default function AdminTopNavbar() {
  const pathname = usePathname();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [notifCount] = useState(3);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageTitle = pageTitles[pathname] ?? 'Admin Panel';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowQuickActions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickAction = (action: string) => {
    setShowQuickActions(false);
    const messages: Record<string, string> = {
      create_campaign: 'Test campaign created successfully',
      add_admin: 'Admin invite sent',
      resolve_alerts: 'All alerts marked as reviewed',
      refresh_data: 'Data refreshed',
    };
    toast.success(messages[action] ?? 'Action completed');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 h-14">
        {/* Left: Page title */}
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Admin Dashboard</p>
            <h1 className="text-base font-bold text-slate-800 leading-tight">{pageTitle}</h1>
          </div>
        </div>

        {/* Right: Status + Notifications + Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Platform Status */}
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Platform Live
          </div>

          {/* Last Sync */}
          <span className="hidden md:block text-xs text-slate-400">Last sync: 2 min ago</span>

          {/* Notifications */}
          <Link href="/admin-panel/notifications" className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Bell size={18} className="text-slate-600" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                {notifCount}
              </span>
            )}
          </Link>

          {/* Quick Actions */}
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
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quick Actions</p>
                </div>
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.action}
                      onClick={() => handleQuickAction(action.action)}
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
