'use client';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { Users, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Ban, Search, ArrowUpRight, Eye, Flag, Download, ChevronDown, Activity, Wallet, AlertTriangle } from 'lucide-react';
import StatusBadge from '@/src/components/ui/StatusBadge';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import AdminPlatformChart from './AdminPlatformChart';
import AdminGMVChart from './AdminGMVChart';

type AdminTab = 'users' | 'campaigns' | 'transactions' | 'withdrawals';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'creator' | 'brand';
  status: 'verified' | 'pending' | 'banned' | 'flagged';
  joinedAt: string;
  totalEarnings?: number;
  totalSpend?: number;
  campaigns?: number;
  collabs?: number;
  followers?: number;
  lastActive: string;
}

interface AdminCampaign {
  id: string;
  title: string;
  brand: string;
  platform: string;
  budget: number;
  status: 'active' | 'completed' | 'flagged' | 'draft';
  applicants: number;
  createdAt: string;
  reportCount: number;
}

interface AdminTransaction {
  id: string;
  type: 'escrow_lock' | 'escrow_release' | 'withdrawal' | 'refund' | 'credit';
  from: string;
  to: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'escrow';
  date: string;
  campaignId?: string;
}

interface AdminWithdrawal {
  id: string;
  creator: string;
  email: string;
  amount: number;
  method: string;
  account: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  fee: number;
}

const adminUsers: AdminUser[] = [
  { id: 'usr-001', name: 'Sofia Martinez', email: 'sofia@viralbridge.io', role: 'creator', status: 'verified', joinedAt: '2025-11-12', totalEarnings: 8650, collabs: 14, followers: 48200, lastActive: '2026-04-14' },
  { id: 'usr-002', name: 'NovaSpark Co.', email: 'brand@novaspark.co', role: 'brand', status: 'verified', joinedAt: '2025-10-08', totalSpend: 42000, campaigns: 8, lastActive: '2026-04-13' },
  { id: 'usr-003', name: 'Priya Nair', email: 'priya@creators.io', role: 'creator', status: 'verified', joinedAt: '2025-12-01', totalEarnings: 5200, collabs: 9, followers: 92100, lastActive: '2026-04-12' },
  { id: 'usr-004', name: 'TechDrop', email: 'marketing@techdrop.com', role: 'brand', status: 'flagged', joinedAt: '2026-01-15', totalSpend: 12000, campaigns: 3, lastActive: '2026-04-11' },
  { id: 'usr-005', name: 'Marcus Webb', email: 'marcus@ugcpro.io', role: 'creator', status: 'pending', joinedAt: '2026-04-10', totalEarnings: 0, collabs: 0, followers: 18500, lastActive: '2026-04-10' },
  { id: 'usr-006', name: 'Aisha Okonkwo', email: 'aisha@beautycreators.co', role: 'creator', status: 'verified', joinedAt: '2026-01-22', totalEarnings: 3100, collabs: 5, followers: 31500, lastActive: '2026-04-09' },
  { id: 'usr-007', name: 'SpamBrand LLC', email: 'fake@spambrand.xyz', role: 'brand', status: 'banned', joinedAt: '2026-03-01', totalSpend: 0, campaigns: 2, lastActive: '2026-03-05' },
  { id: 'usr-008', name: 'Kavya Reddy', email: 'kavya@luminaryskn.com', role: 'brand', status: 'verified', joinedAt: '2025-09-14', totalSpend: 68000, campaigns: 14, lastActive: '2026-04-14' },
  { id: 'usr-009', name: 'Jordan Osei', email: 'jordan@fitcreators.io', role: 'creator', status: 'verified', joinedAt: '2026-02-08', totalEarnings: 4800, collabs: 8, followers: 74200, lastActive: '2026-04-13' },
  { id: 'usr-010', name: 'Mei-Lin Chen', email: 'meichen@skinfluencer.co', role: 'creator', status: 'flagged', joinedAt: '2026-03-20', totalEarnings: 900, collabs: 2, followers: 22800, lastActive: '2026-04-08' },
];

const adminCampaigns: AdminCampaign[] = [
  { id: 'camp-001', title: 'Summer Glow Skincare Launch', brand: 'Luminary Skincare', platform: 'Instagram', budget: 6000, status: 'active', applicants: 34, createdAt: '2026-04-01', reportCount: 0 },
  { id: 'camp-002', title: 'FitPro App — 30-Day Challenge', brand: 'FitPro Health', platform: 'YouTube', budget: 10500, status: 'active', applicants: 18, createdAt: '2026-03-20', reportCount: 0 },
  { id: 'camp-003', title: 'Suspicious Crypto Giveaway', brand: 'SpamBrand LLC', platform: 'Instagram', budget: 500, status: 'flagged', applicants: 142, createdAt: '2026-03-01', reportCount: 8 },
  { id: 'camp-004', title: 'TechDrop Earbuds Review', brand: 'TechDrop', platform: 'YouTube', budget: 6400, status: 'completed', applicants: 52, createdAt: '2026-02-15', reportCount: 2 },
  { id: 'camp-005', title: 'NomadPay Travel Creator Push', brand: 'NomadPay', platform: 'Instagram', budget: 8000, status: 'active', applicants: 27, createdAt: '2026-04-05', reportCount: 0 },
  { id: 'camp-006', title: 'StyleForward Fall Collection', brand: 'StyleForward', platform: 'Instagram', budget: 10800, status: 'draft', applicants: 0, createdAt: '2026-04-10', reportCount: 0 },
  { id: 'camp-007', title: 'GameVault Pro Controller', brand: 'GameVault', platform: 'TikTok', budget: 5400, status: 'active', applicants: 88, createdAt: '2026-03-28', reportCount: 1 },
];

const adminTransactions: AdminTransaction[] = [
  { id: 'txn-a001', type: 'escrow_release', from: 'Escrow', to: 'Sofia Martinez', amount: 1200, status: 'completed', date: '2026-04-13', campaignId: 'camp-001' },
  { id: 'txn-a002', type: 'escrow_lock', from: 'Luminary Skincare', to: 'Escrow', amount: 6000, status: 'escrow', date: '2026-04-11', campaignId: 'camp-001' },
  { id: 'txn-a003', type: 'withdrawal', from: 'Sofia Martinez', to: 'PayPal', amount: 500, status: 'completed', date: '2026-04-10' },
  { id: 'txn-a004', type: 'escrow_release', from: 'Escrow', to: 'Jordan Osei', amount: 3500, status: 'completed', date: '2026-04-09', campaignId: 'camp-002' },
  { id: 'txn-a005', type: 'escrow_lock', from: 'FitPro Health', to: 'Escrow', amount: 10500, status: 'escrow', date: '2026-04-08', campaignId: 'camp-002' },
  { id: 'txn-a006', type: 'withdrawal', from: 'Priya Nair', to: 'Bank Transfer', amount: 2000, status: 'pending', date: '2026-04-07' },
  { id: 'txn-a007', type: 'refund', from: 'Escrow', to: 'SpamBrand LLC', amount: 500, status: 'completed', date: '2026-03-06', campaignId: 'camp-003' },
  { id: 'txn-a008', type: 'escrow_release', from: 'Escrow', to: 'Aisha Okonkwo', amount: 950, status: 'completed', date: '2026-04-06', campaignId: 'camp-004' },
  { id: 'txn-a009', type: 'credit', from: 'ViralBridge', to: 'Sofia Martinez', amount: 450, status: 'completed', date: '2026-03-20' },
  { id: 'txn-a010', type: 'withdrawal', from: 'Mei-Lin Chen', to: 'Wise', amount: 900, status: 'failed', date: '2026-04-05' },
];

const adminWithdrawals: AdminWithdrawal[] = [
  { id: 'wd-001', creator: 'Priya Nair', email: 'priya@creators.io', amount: 2000, method: 'Bank Transfer (ACH)', account: '****8821', status: 'pending', requestedAt: '2026-04-07', fee: 15 },
  { id: 'wd-002', creator: 'Jordan Osei', email: 'jordan@fitcreators.io', amount: 1500, method: 'PayPal', account: 'jordan@fitcreators.io', status: 'pending', requestedAt: '2026-04-08', fee: 15 },
  { id: 'wd-003', creator: 'Aisha Okonkwo', email: 'aisha@beautycreators.co', amount: 800, method: 'Stripe Instant', account: '****4412', status: 'pending', requestedAt: '2026-04-09', fee: 12 },
  { id: 'wd-004', creator: 'Marcus Webb', email: 'marcus@ugcpro.io', amount: 350, method: 'PayPal', account: 'marcus@ugcpro.io', status: 'pending', requestedAt: '2026-04-10', fee: 5.25 },
  { id: 'wd-005', creator: 'Yuki Tanaka', email: 'yuki@beautyco.jp', amount: 1300, method: 'Wise', account: 'yuki@beautyco.jp', status: 'pending', requestedAt: '2026-04-11', fee: 15 },
  { id: 'wd-006', creator: 'Daniela Rossi', email: 'd.rossi@creators.eu', amount: 2200, method: 'Bank Transfer', account: '****9901', status: 'approved', requestedAt: '2026-04-06', fee: 15 },
  { id: 'wd-007', creator: 'Mei-Lin Chen', email: 'meichen@skinfluencer.co', amount: 900, method: 'Wise', account: 'meichen@skinfluencer.co', status: 'rejected', requestedAt: '2026-04-05', fee: 13.5 },
];

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [withdrawalStatuses, setWithdrawalStatuses] = useState<Record<string, AdminWithdrawal['status']>>(
    Object.fromEntries(adminWithdrawals.map(w => [w.id, w.status]))
  );
  const [openUserMenu, setOpenUserMenu] = useState<string | null>(null);

  const gmv = 148200;
  const activeUsers = adminUsers.filter(u => u.status === 'verified').length;
  const pendingWithdrawals = adminWithdrawals.filter(w => withdrawalStatuses[w.id] === 'pending').length;
  const flaggedCampaigns = adminCampaigns.filter(c => c.status === 'flagged').length;
  const escrowVolume = 42800;
  const platformFee = 3640;

  const handleUserAction = (userId: string, action: 'verify' | 'ban' | 'flag') => {
    // BACKEND: PATCH /api/admin/users/:id { action }
    toast.success(`User ${action === 'verify' ? 'verified' : action === 'ban' ? 'banned' : 'flagged'} successfully`);
    setOpenUserMenu(null);
  };

  const handleWithdrawal = (wdId: string, decision: 'approved' | 'rejected') => {
    // BACKEND: PATCH /api/admin/withdrawals/:id { status: decision }
    setWithdrawalStatuses(prev => ({ ...prev, [wdId]: decision }));
    const wd = adminWithdrawals.find(w => w.id === wdId);
    toast.success(`Withdrawal ${decision} for ${wd?.creator}`);
  };

  const handleCampaignAction = (campId: string, action: 'approve' | 'remove') => {
    // BACKEND: PATCH /api/admin/campaigns/:id { action }
    toast.success(`Campaign ${action === 'approve' ? 'approved and unflagged' : 'removed from platform'}`);
  };

  const filteredUsers = adminUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const tabs: { key: AdminTab; label: string; count?: number; alert?: boolean }[] = [
    { key: 'users', label: 'Users', count: adminUsers.length },
    { key: 'campaigns', label: 'Campaigns', count: adminCampaigns.length, alert: flaggedCampaigns > 0 },
    { key: 'transactions', label: 'Transactions', count: adminTransactions.length },
    { key: 'withdrawals', label: 'Withdrawals', count: pendingWithdrawals, alert: pendingWithdrawals > 0 },
  ];

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">Platform oversight — users, campaigns, transactions, and payouts</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <Activity size={13} />
            Platform Live
          </span>
          <span className="text-xs text-slate-400">Last sync: 2 min ago</span>
        </div>
      </div>

      {/* KPI bento — 6 cards: row 1: 3 cols, row 2: 3 cols */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="col-span-2 lg:col-span-1 xl:col-span-2 bg-gradient-to-br from-violet-600 to-violet-800 rounded-xl p-5 text-white shadow-card-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-violet-200 text-xs font-medium uppercase tracking-wide">Platform GMV</p>
            <TrendingUp size={16} className="text-violet-300" />
          </div>
          <p className="text-3xl font-bold tabular-nums">${gmv.toLocaleString()}</p>
          <p className="text-violet-300 text-xs mt-1 flex items-center gap-1">
            <ArrowUpRight size={12} /> +18.4% this month
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Active Users</p>
            <Users size={15} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">{activeUsers}</p>
          <p className="text-slate-400 text-xs mt-1">{adminUsers.filter(u => u.status === 'pending').length} pending verification</p>
        </div>

        <div className={`bg-white rounded-xl border p-5 shadow-card ${pendingWithdrawals > 0 ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-xs font-medium uppercase tracking-wide ${pendingWithdrawals > 0 ? 'text-amber-600' : 'text-slate-500'}`}>Pending Payouts</p>
            <Clock size={15} className={pendingWithdrawals > 0 ? 'text-amber-500' : 'text-slate-400'} />
          </div>
          <p className={`text-2xl font-bold tabular-nums ${pendingWithdrawals > 0 ? 'text-amber-700' : 'text-slate-800'}`}>{pendingWithdrawals}</p>
          <p className="text-slate-400 text-xs mt-1">Awaiting approval</p>
        </div>

        <div className={`bg-white rounded-xl border p-5 shadow-card ${flaggedCampaigns > 0 ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-xs font-medium uppercase tracking-wide ${flaggedCampaigns > 0 ? 'text-red-600' : 'text-slate-500'}`}>Flagged Campaigns</p>
            <Flag size={15} className={flaggedCampaigns > 0 ? 'text-red-500' : 'text-slate-400'} />
          </div>
          <p className={`text-2xl font-bold tabular-nums ${flaggedCampaigns > 0 ? 'text-red-700' : 'text-slate-800'}`}>{flaggedCampaigns}</p>
          <p className="text-slate-400 text-xs mt-1">Require review</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Escrow Volume</p>
            <Wallet size={15} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">${escrowVolume.toLocaleString()}</p>
          <p className="text-blue-600 text-xs mt-1">Currently locked</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Platform Fees</p>
            <DollarSign size={15} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">${platformFee.toLocaleString()}</p>
          <p className="text-emerald-600 text-xs mt-1">This month</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">GMV Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Monthly gross merchandise volume — last 6 months</p>
          <AdminGMVChart />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Campaigns by Platform</h3>
          <p className="text-xs text-slate-400 mb-4">Distribution of active campaigns across platforms</p>
          <AdminPlatformChart />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card">
        <div className="flex border-b border-slate-100 px-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={`admin-tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-violet-600 text-violet-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  tab.alert ? 'bg-red-100 text-red-700' :
                  activeTab === tab.key ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Users tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white"
                />
              </div>
              <div className="relative">
                <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700">
                  <option value="all">All Roles</option>
                  <option value="creator">Creators</option>
                  <option value="brand">Brands</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700">
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="flagged">Flagged</option>
                  <option value="banned">Banned</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors ml-auto">
                <Download size={13} /> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['User', 'Role', 'Status', 'Joined', 'Earnings / Spend', 'Activity', 'Last Active', 'Actions'].map(col => (
                      <th key={`usr-th-${col}`} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-violet-700 text-xs font-bold">{user.name.slice(0, 2).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.role === 'creator' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.role === 'creator' ? 'Creator' : 'Brand'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-sm text-slate-600">{new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {user.role === 'creator' ? (
                          <p className="text-sm font-semibold text-emerald-700 tabular-nums">${(user.totalEarnings ?? 0).toLocaleString()}</p>
                        ) : (
                          <p className="text-sm font-semibold text-blue-700 tabular-nums">${(user.totalSpend ?? 0).toLocaleString()}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-sm text-slate-600 tabular-nums">
                          {user.role === 'creator' ? `${user.collabs} collabs` : `${user.campaigns} campaigns`}
                        </p>
                        {user.role === 'creator' && user.followers && (
                          <p className="text-xs text-slate-400">{(user.followers / 1000).toFixed(1)}K followers</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-xs text-slate-500">{new Date(user.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleUserAction(user.id, 'verify')} className="p-1.5 rounded-md hover:bg-emerald-50 hover:text-emerald-700 text-slate-400 transition-colors" title="Verify account">
                            <CheckCircle size={14} />
                          </button>
                          <button onClick={() => handleUserAction(user.id, 'flag')} className="p-1.5 rounded-md hover:bg-amber-50 hover:text-amber-700 text-slate-400 transition-colors" title="Flag account">
                            <Flag size={14} />
                          </button>
                          <button onClick={() => handleUserAction(user.id, 'ban')} className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-700 text-slate-400 transition-colors" title="Ban account — removes all active campaigns">
                            <Ban size={14} />
                          </button>
                          <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 transition-colors" title="View full profile">
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Campaigns tab */}
        {activeTab === 'campaigns' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Campaign', 'Brand', 'Platform', 'Budget', 'Status', 'Applicants', 'Reports', 'Created', 'Actions'].map(col => (
                    <th key={`camp-th-${col}`} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {adminCampaigns.map(campaign => (
                  <tr key={campaign.id} className={`hover:bg-slate-50/60 transition-colors group ${campaign.status === 'flagged' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-slate-800 line-clamp-1 max-w-[200px]">{campaign.title}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-slate-600">{campaign.brand}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <PlatformBadge platform={campaign.platform} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm font-semibold text-slate-800 tabular-nums">${campaign.budget.toLocaleString()}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-slate-700 tabular-nums">{campaign.applicants}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {campaign.reportCount > 0 ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-700">
                          <AlertTriangle size={12} /> {campaign.reportCount}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-slate-500">{new Date(campaign.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {campaign.status === 'flagged' && (
                          <>
                            <button onClick={() => handleCampaignAction(campaign.id, 'approve')} className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-colors" title="Approve and unflag this campaign">
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button onClick={() => handleCampaignAction(campaign.id, 'remove')} className="flex items-center gap-1 text-xs px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md transition-colors" title="Remove campaign from platform permanently">
                              <XCircle size={12} /> Remove
                            </button>
                          </>
                        )}
                        <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 transition-colors" title="View campaign details">
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Transactions tab */}
        {activeTab === 'transactions' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Txn ID', 'Type', 'From', 'To', 'Amount', 'Status', 'Date', 'Campaign'].map(col => (
                    <th key={`txn-th2-${col}`} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {adminTransactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-mono text-slate-500">{txn.id}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                        txn.type === 'escrow_release' ? 'bg-emerald-50 text-emerald-700' :
                        txn.type === 'escrow_lock' ? 'bg-blue-50 text-blue-700' :
                        txn.type === 'withdrawal' ? 'bg-slate-100 text-slate-600' :
                        txn.type === 'refund'? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-700'
                      }`}>
                        {txn.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-slate-700">{txn.from}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-slate-700">{txn.to}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm font-bold text-slate-800 tabular-nums">${txn.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-slate-500">{new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {txn.campaignId ? (
                        <span className="text-xs font-mono text-violet-600">{txn.campaignId}</span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Withdrawals tab */}
        {activeTab === 'withdrawals' && (
          <div>
            {pendingWithdrawals > 0 && (
              <div className="mx-5 mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-700 font-medium">{pendingWithdrawals} withdrawal{pendingWithdrawals !== 1 ? 's' : ''} pending approval — review and process within 1 business day</p>
              </div>
            )}
            <div className="overflow-x-auto mt-2">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Creator', 'Amount', 'Net Payout', 'Method', 'Account', 'Status', 'Requested', 'Actions'].map(col => (
                      <th key={`wd-th-${col}`} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {adminWithdrawals.map(wd => {
                    const currentStatus = withdrawalStatuses[wd.id];
                    return (
                      <tr key={wd.id} className={`hover:bg-slate-50/60 transition-colors group ${currentStatus === 'pending' ? 'bg-amber-50/20' : ''}`}>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-slate-800">{wd.creator}</p>
                          <p className="text-xs text-slate-400 font-mono">{wd.email}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="text-sm font-bold text-slate-800 tabular-nums">${wd.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="text-sm font-semibold text-emerald-700 tabular-nums">${(wd.amount - wd.fee).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                          <p className="text-xs text-slate-400">fee: ${wd.fee.toFixed(2)}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="text-sm text-slate-600">{wd.method}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="text-xs font-mono text-slate-500">{wd.account}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <StatusBadge status={currentStatus as 'pending' | 'approved' | 'rejected'} />
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="text-sm text-slate-500">{new Date(wd.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {currentStatus === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleWithdrawal(wd.id, 'approved')}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-medium transition-colors"
                                title={`Approve withdrawal of $${wd.amount} to ${wd.creator}`}
                              >
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button
                                onClick={() => handleWithdrawal(wd.id, 'rejected')}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-colors"
                                title={`Reject withdrawal — funds returned to ${wd.creator}'s wallet`}
                              >
                                <XCircle size={12} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 capitalize">{currentStatus}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}