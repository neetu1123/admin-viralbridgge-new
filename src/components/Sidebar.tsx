'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from './ui/AppLogo';
import { Search, Briefcase, Wallet, MessageSquare, ShieldCheck, ChevronLeft, ChevronRight, Bell, Settings, LogOut, User, TrendingUp, Users, FileText, CreditCard } from 'lucide-react';
// import Icon from '@/components/ui/AppIcon';


interface SidebarProps {
  role?: 'creator' | 'brand' | 'admin';
}

const creatorNav = [
  { label: 'Discover Campaigns', icon: Search, href: '/campaign-discovery', badge: null },
  { label: 'My Applications', icon: FileText, href: '/campaign-discovery', badge: '3' },
  { label: 'Messages', icon: MessageSquare, href: '/messaging-inbox', badge: '5' },
  { label: 'Wallet', icon: Wallet, href: '/wallet-payments', badge: null },
  { label: 'My Profile', icon: User, href: '/sign-up-login-screen', badge: null },
];

const brandNav = [
  { label: 'Campaigns', icon: Briefcase, href: '/brand-campaign-management', badge: null },
  { label: 'Applicants', icon: Users, href: '/brand-campaign-management', badge: '12' },
  { label: 'Messages', icon: MessageSquare, href: '/messaging-inbox', badge: '2' },
  { label: 'Wallet & Spend', icon: CreditCard, href: '/wallet-payments', badge: null },
  { label: 'Analytics', icon: TrendingUp, href: '/brand-campaign-management', badge: null },
];

const adminNav = [
  { label: 'Admin Panel', icon: ShieldCheck, href: '/admin-panel', badge: null },
  { label: 'Users', icon: Users, href: '/admin-panel', badge: '4' },
  { label: 'Campaigns', icon: Briefcase, href: '/admin-panel', badge: null },
  { label: 'Transactions', icon: CreditCard, href: '/admin-panel', badge: null },
  { label: 'Withdrawals', icon: Wallet, href: '/admin-panel', badge: '7' },
];

export default function Sidebar({ role = 'creator' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = role === 'admin' ? adminNav : role === 'brand' ? brandNav : creatorNav;

  const roleLabel = role === 'admin' ? 'Admin' : role === 'brand' ? 'Brand' : 'Creator';
  const roleColor = role === 'admin' ? 'bg-red-100 text-red-700' : role === 'brand' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700';

  return (
    <aside
      className={`relative  bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex-shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}
      style={{ minHeight: '100vh' }}
    >
      {/* Logo */}
      <div className={` px-4 py-5 border-b border-slate-100 ${collapsed ? 'justify-center px-0' : ''}`}>
        {/* <AppLogo size={32} /> */}
        
          <AppLogo src="/viralbridge_logo_transparent.png"
            size={200} />
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1">
          <span className={`text-xs font-600 px-2 py-0.5 rounded-full font-medium ${roleColor}`}>{roleLabel} Account</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        <p className={`text-xs font-medium text-slate-400 uppercase tracking-widest mb-2 px-2 ${collapsed ? 'hidden' : ''}`}>Navigation</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={`nav-${item.label}`}
              href={item.href}
              className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-150 relative ${
                isActive
                  ? 'bg-violet-50 text-violet-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-violet-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
              {!collapsed && <span className="text-sm flex-1">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-1 right-1 bg-violet-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className={`text-xs font-medium text-slate-400 uppercase tracking-widest mb-2 px-2 ${collapsed ? 'hidden' : ''}`}>Other</p>
          <Link href="/sign-up-login-screen" className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-150 ${collapsed ? 'justify-center' : ''}`} title={collapsed ? 'Notifications' : undefined}>
            <Bell size={18} className="flex-shrink-0 text-slate-500 group-hover:text-slate-700" />
            {!collapsed && <span className="text-sm">Notifications</span>}
          </Link>
          <Link href="/sign-up-login-screen" className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-150 ${collapsed ? 'justify-center' : ''}`} title={collapsed ? 'Settings' : undefined}>
            <Settings size={18} className="flex-shrink-0 text-slate-500 group-hover:text-slate-700" />
            {!collapsed && <span className="text-sm">Settings</span>}
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className={`border-t border-slate-100 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <span className="text-violet-700 text-xs font-semibold">
                {role === 'admin' ? 'AD' : role === 'brand' ? 'NK' : 'SM'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {role === 'admin' ? 'Admin User' : role === 'brand' ? 'NovaSpark Co.' : 'Sofia Martinez'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {role === 'admin' ? 'admin@viralbridge.io' : role === 'brand' ? 'brand@novaspark.co' : 'sofia@creators.io'}
              </p>
            </div>
            <button className="p-1 rounded hover:bg-slate-100 transition-colors" title="Sign out">
              <LogOut size={15} className="text-slate-400" />
            </button>
          </div>
        ) : (
          <button className="p-1 rounded hover:bg-slate-100 transition-colors" title="Sign out">
            <LogOut size={16} className="text-slate-400" />
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-150 z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} className="text-slate-500" /> : <ChevronLeft size={12} className="text-slate-500" />}
      </button>
    </aside>
  );
}