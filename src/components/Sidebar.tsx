'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '../components/ui/AppLogo';
import { adminApi, brandApi, creatorApi } from '@/src/lib/api';
import { logout } from '@/src/lib/auth';
import { getCurrentUser } from '@/src/lib/useAuth';
import { initials } from '@/src/lib/mappers';
import { Search, Briefcase, Wallet, MessageSquare, ChevronLeft, ChevronRight, Bell, Settings, LogOut, User, Users, FileText, CreditCard, Compass, BarChart3, BookOpen, LayoutDashboard, Flag, Scale, ClipboardList, UserCog, Lock, ChevronDown, ChevronUp, DollarSign, Loader2, ShieldCheck, Upload, HelpCircle } from 'lucide-react';
import { useUnreadCount } from '@/src/components/NotificationsPanel';


interface SidebarProps {
  role?: 'creator' | 'brand' | 'admin';
}

const creatorNav = [
  { label: 'Discover Campaigns', icon: Search, href: '/campaign-discovery', badge: null },
  { label: 'My Applications', icon: FileText, href: '/my-applications', badge: '3' },
  { label: 'My Deliverables', icon: Upload, href: '/creator-deliverables', badge: null },
  { label: 'Messages', icon: MessageSquare, href: '/messaging-inbox', badge: '5' },
  { label: 'Wallet', icon: Wallet, href: '/wallet-payments', badge: null },
  { label: 'Analytics', icon: BarChart3, href: '/creator/analytics', badge: null },
  { label: 'My Profile', icon: User, href: '/creator-profile', badge: null },
];

const brandNav = [
  { label: 'Campaigns', icon: Briefcase, href: '/brand-campaign-management', badge: null },
  { label: 'Applicants', icon: Users, href: '/brand-applicant', badge: '12' },
  { label: 'Review Deliverables', icon: Upload, href: '/brand-deliverables', badge: null },
  { label: 'Creator Discovery', icon: Compass, href: '/creator-discovery', badge: null },
  { label: 'My Creators', icon: BookOpen, href: '/my-creators', badge: null },
  { label: 'Messages', icon: MessageSquare, href: '/brand-messages', badge: '2' },
  { label: 'Wallet & Spend', icon: CreditCard, href: '/brand-wallet', badge: null },
  { label: 'Analytics', icon: BarChart3, href: '/analytics', badge: null },
];

interface AdminNavSection {
  section: string;
  items: { label: string; icon: React.ElementType; href: string; badge?: string | null; badgeColor?: string }[];
}

const adminNavSections: AdminNavSection[] = [
  {
    section: 'Core',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/admin-panel', badge: null },
      { label: 'Analytics', icon: BarChart3, href: '/admin/analytics', badge: null },
      { label: 'Users', icon: Users, href: '/admin-panel/users', badge: '4', badgeColor: 'violet' },
      { label: 'KYC Verification', icon: ShieldCheck, href: '/admin-panel/kyc', badge: null },
      { label: 'Campaigns', icon: Briefcase, href: '/admin-panel/campaigns', badge: null },
    ],
  },
  {
    section: 'Finance',
    items: [
      { label: 'Transactions', icon: CreditCard, href: '/admin-panel/transactions', badge: null },
      { label: 'Escrow', icon: Lock, href: '/admin-panel/escrow', badge: null },
      { label: 'Payouts', icon: DollarSign, href: '/admin-panel/payouts', badge: '5', badgeColor: 'amber' },
    ],
  },
  {
    section: 'Moderation',
    items: [
      { label: 'Flagged Content', icon: Flag, href: '/admin-panel/flagged', badge: '1', badgeColor: 'red' },
      { label: 'Disputes', icon: Scale, href: '/admin-panel/disputes', badge: null as string | null, badgeColor: 'orange' },
    ],
  },
  {
    section: 'System',
    items: [
      { label: 'Notifications', icon: Bell, href: '/admin-panel/notifications', badge: null },
      { label: 'Settings', icon: Settings, href: '/admin-panel/settings', badge: null },
      { label: 'Admin Roles', icon: UserCog, href: '/admin-panel/roles', badge: null },
      { label: 'Audit Logs', icon: ClipboardList, href: '/admin-panel/audit-logs', badge: null },
    ],
  },
];

const badgeColorMap: Record<string, string> = {
  violet: 'bg-violet-100 text-violet-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
};

export default function Sidebar({ role = 'creator' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [disputeBadge, setDisputeBadge] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser({ name: user.name, email: user.email });
    }
  }, []);

  const handleSignOut = useCallback(() => {
    if (signingOut) return;
    setSigningOut(true);
    void logout();
  }, [signingOut]);

  const userInitials = currentUser ? initials(currentUser.name) : 'U';
  const displayName = currentUser?.name ?? 'User';
  const displayEmail = currentUser?.email ?? '';
  const notificationApi = role === 'brand' ? brandApi : creatorApi;
  const unreadNotifications = useUnreadCount(notificationApi, role === 'creator' || role === 'brand');

  useEffect(() => {
    if (role !== 'admin') return;
    adminApi
      .getDisputeStats()
      .then((stats) => setDisputeBadge(stats.openCount > 0 ? String(stats.openCount) : null))
      .catch(() => setDisputeBadge(null));
  }, [role, pathname]);

  const roleLabel = role === 'admin' ? 'Admin' : role === 'brand' ? 'Brand' : 'Creator';
  const roleColor = role === 'admin' ? 'bg-red-100 text-red-700' : role === 'brand' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700';

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const isAdminRouteActive = (href: string) => {
    if (href === '/admin-panel') return pathname === '/admin-panel';
    return pathname.startsWith(href);
  };

  if (role === 'admin') {
    return (
      <aside
        className={`relative flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex-shrink-0 ${collapsed ? 'w-16' : 'w-[280px]'}`}
        style={{ minHeight: '100vh' }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 ${collapsed ? 'justify-center px-0' : ''}`}>
          <AppLogo size={130} />
          {!collapsed && (
            <div>
              <span className="ml-2 text-xs font-medium bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md">Admin</span>
            </div>
          )}
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-thin">
          {adminNavSections.map((section) => (
            <div key={section.section} className="mb-1">
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.section)}
                  className="w-full flex items-center justify-between px-2 py-1.5 mb-0.5 group"
                >
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
                    {section.section}
                  </span>
                  {collapsedSections[section.section]
                    ? <ChevronDown size={12} className="text-slate-300" />
                    : <ChevronUp size={12} className="text-slate-300" />
                  }
                </button>
              )}
              {!collapsedSections[section.section] && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = isAdminRouteActive(item.href);
                    const Icon = item.icon;
                    const badge = item.href === '/admin-panel/disputes' ? disputeBadge : item.badge;
                    const badgeCls = item.badgeColor ? badgeColorMap[item.badgeColor] : 'bg-violet-100 text-violet-700';
                    return (
                      <Link
                        key={`admin-nav-${item.label}`}
                        href={item.href}
                        className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-150 relative ${
                          isActive
                            ? 'bg-violet-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                        } ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon size={17} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
                        {!collapsed && <span className="text-sm flex-1 font-medium">{item.label}</span>}
                        {!collapsed && badge && (
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${isActive ? 'bg-white/20 text-white' : badgeCls}`}>
                            {badge}
                          </span>
                        )}
                        {collapsed && badge && (
                          <span className={`absolute top-1 right-1 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none ${item.badgeColor === 'red' ? 'bg-red-500' : item.badgeColor === 'amber' ? 'bg-amber-500' : item.badgeColor === 'orange' ? 'bg-orange-500' : 'bg-violet-600'}`}>
                            {badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
              {!collapsed && <div className="mt-2 mb-1 border-b border-slate-100" />}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className={`border-t border-slate-100 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">{userInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="p-1 rounded hover:bg-slate-100 transition-colors disabled:opacity-50"
                title="Sign out"
              >
                {signingOut ? <Loader2 size={15} className="text-slate-400 animate-spin" /> : <LogOut size={15} className="text-slate-400" />}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="p-1 rounded hover:bg-slate-100 transition-colors disabled:opacity-50"
              title="Sign out"
            >
              {signingOut ? <Loader2 size={16} className="text-slate-400 animate-spin" /> : <LogOut size={16} className="text-slate-400" />}
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

  // ── Creator / Brand sidebar (unchanged) ──────────────────────────────────
  const navItems = role === 'brand' ? brandNav : creatorNav;

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex-shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}
      style={{ minHeight: '100vh' }}
    >
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 ${collapsed ? 'justify-center px-0' : ''}`}>
        <AppLogo size={150} />
      </div>
      {!collapsed && (
        <div className="px-4 pt-3 pb-1">
          <span className={`text-xs font-600 px-2 py-0.5 rounded-full font-medium ${roleColor}`}>{roleLabel} Account</span>
        </div>
      )}
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
                isActive ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-violet-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
              {!collapsed && <span className="text-sm flex-1">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{item.badge}</span>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-1 right-1 bg-violet-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none">{item.badge}</span>
              )}
            </Link>
          );
        })}
        <div className="pt-4">
          <p className={`text-xs font-medium text-slate-400 uppercase tracking-widest mb-2 px-2 ${collapsed ? 'hidden' : ''}`}>Other</p>
          <Link href={role === 'brand' ? '/brand-notifications' : '/creator-notifications'} className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-150 relative ${collapsed ? 'justify-center' : ''}`} title={collapsed ? 'Notifications' : undefined}>
            <Bell size={18} className="flex-shrink-0 text-slate-500 group-hover:text-slate-700" />
            {!collapsed && <span className="text-sm flex-1">Notifications</span>}
            {!collapsed && unreadNotifications > 0 && (
              <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{unreadNotifications}</span>
            )}
            {collapsed && unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 bg-violet-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>
            )}
          </Link>
          <Link href={role === 'brand' ? '/brand-settings' : '/creator-settings'} className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-150 ${collapsed ? 'justify-center' : ''}`} title={collapsed ? 'Settings' : undefined}>
            <Settings size={18} className="flex-shrink-0 text-slate-500 group-hover:text-slate-700" />
            {!collapsed && <span className="text-sm">Settings</span>}
          </Link>
          <Link href="/troubleshoot" className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-150 ${collapsed ? 'justify-center' : ''}`} title={collapsed ? 'Help & Support' : undefined}>
            <HelpCircle size={18} className="flex-shrink-0 text-slate-500 group-hover:text-slate-700" />
            {!collapsed && <span className="text-sm">Help & Support</span>}
          </Link>
        </div>
      </nav>
      <div className={`border-t border-slate-100 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <span className="text-violet-700 text-xs font-semibold">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="p-1 rounded hover:bg-slate-100 transition-colors disabled:opacity-50"
              title="Sign out"
            >
              {signingOut ? <Loader2 size={15} className="text-slate-400 animate-spin" /> : <LogOut size={15} className="text-slate-400" />}
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="p-1 rounded hover:bg-slate-100 transition-colors disabled:opacity-50"
            title="Sign out"
          >
            {signingOut ? <Loader2 size={16} className="text-slate-400 animate-spin" /> : <LogOut size={16} className="text-slate-400" />}
          </button>
        )}
      </div>
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