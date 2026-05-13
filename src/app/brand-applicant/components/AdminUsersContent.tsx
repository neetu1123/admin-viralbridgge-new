'use client';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { Search, ChevronDown, CheckCircle, Ban, Eye, UserX, UserCheck, X, Activity } from 'lucide-react';


interface AdminUser {
  id: string; name: string; email: string; role: 'creator' | 'brand';
  status: 'active' | 'suspended' | 'pending_kyc' | 'banned';
  kycStatus: 'verified' | 'pending' | 'not_submitted' | 'rejected';
  joinedAt: string; totalEarnings?: number; totalSpend?: number;
  campaigns?: number; collabs?: number; followers?: number; lastActive: string;
  activityLog: { date: string; action: string }[];
}

const adminUsers: AdminUser[] = [
  { id: 'usr-001', name: 'Sofia Martinez', email: 'sofia@viralbridge.io', role: 'creator', status: 'active', kycStatus: 'verified', joinedAt: '2025-11-12', totalEarnings: 8650, collabs: 14, followers: 48200, lastActive: '2026-04-14', activityLog: [{ date: '2026-04-14', action: 'Completed campaign: Summer Glow' }, { date: '2026-04-10', action: 'Withdrew $500 via PayPal' }, { date: '2026-04-01', action: 'Applied to 3 campaigns' }] },
  { id: 'usr-002', name: 'NovaSpark Co.', email: 'brand@novaspark.co', role: 'brand', status: 'active', kycStatus: 'verified', joinedAt: '2025-10-08', totalSpend: 42000, campaigns: 8, lastActive: '2026-04-13', activityLog: [{ date: '2026-04-13', action: 'Created campaign: Fall Collection' }, { date: '2026-04-08', action: 'Released payment to Jordan Osei' }] },
  { id: 'usr-003', name: 'Priya Nair', email: 'priya@creators.io', role: 'creator', status: 'active', kycStatus: 'verified', joinedAt: '2025-12-01', totalEarnings: 5200, collabs: 9, followers: 92100, lastActive: '2026-04-12', activityLog: [{ date: '2026-04-12', action: 'Submitted deliverable for FitPro campaign' }, { date: '2026-04-07', action: 'Requested withdrawal of $2,000' }] },
  { id: 'usr-004', name: 'TechDrop', email: 'marketing@techdrop.com', role: 'brand', status: 'suspended', kycStatus: 'pending', joinedAt: '2026-01-15', totalSpend: 12000, campaigns: 3, lastActive: '2026-04-11', activityLog: [{ date: '2026-04-11', action: 'Account suspended: payment dispute' }, { date: '2026-04-05', action: 'Flagged by creator: late payment' }] },
  { id: 'usr-005', name: 'Marcus Webb', email: 'marcus@ugcpro.io', role: 'creator', status: 'pending_kyc', kycStatus: 'not_submitted', joinedAt: '2026-04-10', totalEarnings: 0, collabs: 0, followers: 18500, lastActive: '2026-04-10', activityLog: [{ date: '2026-04-10', action: 'Account created — KYC pending' }] },
  { id: 'usr-006', name: 'Aisha Okonkwo', email: 'aisha@beautycreators.co', role: 'creator', status: 'active', kycStatus: 'verified', joinedAt: '2026-01-22', totalEarnings: 3100, collabs: 5, followers: 31500, lastActive: '2026-04-09', activityLog: [{ date: '2026-04-09', action: 'Received payment: $950' }] },
  { id: 'usr-007', name: 'SpamBrand LLC', email: 'fake@spambrand.xyz', role: 'brand', status: 'banned', kycStatus: 'rejected', joinedAt: '2026-03-01', totalSpend: 0, campaigns: 2, lastActive: '2026-03-05', activityLog: [{ date: '2026-03-05', action: 'Account banned: fraudulent activity' }, { date: '2026-03-03', action: 'Campaign flagged: 8 reports' }] },
  { id: 'usr-008', name: 'Kavya Reddy', email: 'kavya@luminaryskn.com', role: 'brand', status: 'active', kycStatus: 'verified', joinedAt: '2025-09-14', totalSpend: 68000, campaigns: 14, lastActive: '2026-04-14', activityLog: [{ date: '2026-04-14', action: 'Approved 3 creator deliverables' }] },
  { id: 'usr-009', name: 'Jordan Osei', email: 'jordan@fitcreators.io', role: 'creator', status: 'active', kycStatus: 'verified', joinedAt: '2026-02-08', totalEarnings: 4800, collabs: 8, followers: 74200, lastActive: '2026-04-13', activityLog: [{ date: '2026-04-13', action: 'Completed FitPro 30-Day Challenge' }] },
  { id: 'usr-010', name: 'Mei-Lin Chen', email: 'meichen@skinfluencer.co', role: 'creator', status: 'suspended', kycStatus: 'pending', joinedAt: '2026-03-20', totalEarnings: 900, collabs: 2, followers: 22800, lastActive: '2026-04-08', activityLog: [{ date: '2026-04-08', action: 'Account suspended: withdrawal failed (3x)' }] },
];

const kycBadge: Record<string, { label: string; cls: string }> = {
  verified: { label: 'Verified', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  not_submitted: { label: 'Not Submitted', cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border border-red-200' },
};

const statusBadge: Record<string, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  suspended: { label: 'Suspended', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  pending_kyc: { label: 'Pending KYC', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  banned: { label: 'Banned', cls: 'bg-red-50 text-red-700 border border-red-200' },
};

export default function AdminUsersContent() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activityUser, setActivityUser] = useState<AdminUser | null>(null);

  const filtered = adminUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const totalCreators = adminUsers.filter(u => u.role === 'creator').length;
  const totalBrands = adminUsers.filter(u => u.role === 'brand').length;
  const pendingKyc = adminUsers.filter(u => u.kycStatus === 'pending' || u.kycStatus === 'not_submitted').length;
  const suspended = adminUsers.filter(u => u.status === 'suspended' || u.status === 'banned').length;

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage creators, brands, KYC verification, and account status</p>
        </div>
        <button
          onClick={() => toast.success('Export started')}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all"
        >
          Export Users
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Creators', value: totalCreators, sub: 'registered creators', color: 'text-violet-700', bg: 'bg-violet-50' },
          { label: 'Total Brands', value: totalBrands, sub: 'registered brands', color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Pending KYC', value: pendingKyc, sub: 'require verification', color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Suspended / Banned', value: suspended, sub: 'restricted accounts', color: 'text-red-700', bg: 'bg-red-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white w-full"
            />
          </div>
          <div className="relative">
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700">
              <option value="all">All Roles</option>
              <option value="creator">Creators</option>
              <option value="brand">Brands</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending_kyc">Pending KYC</option>
              <option value="banned">Banned</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['User', 'Role', 'Status', 'KYC', 'Earnings / Spend', 'Activity', 'Last Active', 'Actions'].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${user.role === 'brand' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'}`}>
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user.role === 'brand' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-violet-50 text-violet-700 border border-violet-200'}`}>
                      {user.role === 'brand' ? 'Brand' : 'Creator'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBadge[user.status]?.cls}`}>
                      {statusBadge[user.status]?.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${kycBadge[user.kycStatus]?.cls}`}>
                      {kycBadge[user.kycStatus]?.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {user.role === 'creator' ? (
                      <div>
                        <p className="text-sm font-bold text-emerald-700 tabular-nums">${(user.totalEarnings ?? 0).toLocaleString()}</p>
                        <p className="text-xs text-slate-400">{user.collabs} collabs · {((user.followers ?? 0) / 1000).toFixed(1)}K followers</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-blue-700 tabular-nums">${(user.totalSpend ?? 0).toLocaleString()}</p>
                        <p className="text-xs text-slate-400">{user.campaigns} campaigns</p>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <button
                      onClick={() => setActivityUser(user)}
                      className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
                    >
                      <Activity size={13} /> View Log
                    </button>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-xs text-slate-500">{user.lastActive}</p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user.kycStatus === 'pending' && (
                        <button
                          onClick={() => toast.success(`KYC verified for ${user.name}`)}
                          className="p-1.5 rounded-md hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 transition-colors"
                          title="Verify KYC"
                        >
                          <UserCheck size={14} />
                        </button>
                      )}
                      {user.status === 'active' && (
                        <button
                          onClick={() => toast.warning(`${user.name} suspended`)}
                          className="p-1.5 rounded-md hover:bg-amber-50 hover:text-amber-700 text-slate-500 transition-colors"
                          title="Suspend"
                        >
                          <UserX size={14} />
                        </button>
                      )}
                      {user.status === 'suspended' && (
                        <button
                          onClick={() => toast.success(`${user.name} unsuspended`)}
                          className="p-1.5 rounded-md hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 transition-colors"
                          title="Unsuspend"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {user.status !== 'banned' && (
                        <button
                          onClick={() => toast.error(`${user.name} banned`)}
                          className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-700 text-slate-500 transition-colors"
                          title="Ban"
                        >
                          <Ban size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => setActivityUser(user)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
                        title="View activity"
                      >
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

      {/* Activity Log Modal */}
      {activityUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">Activity Log</h3>
                <p className="text-xs text-slate-400 mt-0.5">{activityUser.name} · {activityUser.email}</p>
              </div>
              <button onClick={() => setActivityUser(null)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3 max-h-80 overflow-y-auto">
              {activityUser.activityLog.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700">{entry.action}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{entry.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-100">
              <button onClick={() => setActivityUser(null)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm py-2.5 rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
