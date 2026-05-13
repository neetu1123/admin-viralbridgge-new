'use client';
import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { Search, ChevronDown, MessageSquare, Eye, Clock, CheckCircle, XCircle, Briefcase, DollarSign, Star } from 'lucide-react';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import Link from 'next/link';
import Icon from '@/src/components/ui/AppIcon';


interface Application {
  id: string; campaignTitle: string; brand: string; brandAvatar: string;
  platform: string; budget: number; appliedAt: string;
  status: 'pending' | 'shortlisted' | 'approved' | 'rejected' | 'completed';
  deliverables: string[]; deadline: string; paymentStatus?: 'pending' | 'in_escrow' | 'released';
  paymentAmount?: number; feedback?: string;
}

const applications: Application[] = [
  { id: 'myapp-001', campaignTitle: 'Summer Glow Skincare Launch', brand: 'Luminary Skincare', brandAvatar: 'LS', platform: 'Instagram', budget: 1200, appliedAt: '2026-04-10', status: 'approved', deliverables: ['2 Feed Posts', '4 Stories', '1 Reel'], deadline: '2026-05-01', paymentStatus: 'in_escrow', paymentAmount: 1200 },
  { id: 'myapp-002', campaignTitle: 'FitPro App — 30-Day Challenge', brand: 'FitPro Health', brandAvatar: 'FP', platform: 'YouTube', budget: 3500, appliedAt: '2026-04-08', status: 'approved', deliverables: ['1 Long-form Video', '2 Shorts'], deadline: '2026-05-15', paymentStatus: 'in_escrow', paymentAmount: 3500 },
  { id: 'myapp-003', campaignTitle: 'StyleForward Fall Collection', brand: 'StyleForward', brandAvatar: 'SF', platform: 'Instagram', budget: 1800, appliedAt: '2026-04-12', status: 'shortlisted', deliverables: ['2 Posts', '5 Stories', '1 Reel'], deadline: '2026-05-10' },
  { id: 'myapp-004', campaignTitle: 'NomadPay Travel Creator Push', brand: 'NomadPay', brandAvatar: 'NP', platform: 'Instagram', budget: 2000, appliedAt: '2026-04-05', status: 'pending', deliverables: ['3 Posts', '6 Stories', 'Bio Link'], deadline: '2026-05-20' },
  { id: 'myapp-005', campaignTitle: 'TechDrop Wireless Earbuds Review', brand: 'TechDrop', brandAvatar: 'TD', platform: 'YouTube', budget: 800, appliedAt: '2026-03-28', status: 'rejected', deliverables: ['1 Unboxing Video', '1 Review'], deadline: '2026-04-28', feedback: 'We were looking for creators with a larger tech-focused audience. Thank you for applying!' },
  { id: 'myapp-006', campaignTitle: 'MindClear Meditation App', brand: 'MindClear', brandAvatar: 'MC', platform: 'Instagram', budget: 750, appliedAt: '2026-03-20', status: 'completed', deliverables: ['1 Feed Post', '3 Stories', '1 Reel'], deadline: '2026-04-08', paymentStatus: 'released', paymentAmount: 750 },
  { id: 'myapp-007', campaignTitle: 'Harvest Kitchen — Home Chef Series', brand: 'Harvest Kitchen', brandAvatar: 'HK', platform: 'TikTok', budget: 600, appliedAt: '2026-03-15', status: 'completed', deliverables: ['3 TikTok Videos', '1 Duet'], deadline: '2026-04-01', paymentStatus: 'released', paymentAmount: 600 },
];

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  pending: { label: 'Pending Review', cls: 'bg-amber-50 text-amber-700 border border-amber-200', icon: Clock },
  shortlisted: { label: 'Shortlisted', cls: 'bg-violet-50 text-violet-700 border border-violet-200', icon: Star },
  approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle },
  rejected: { label: 'Not Selected', cls: 'bg-red-50 text-red-700 border border-red-200', icon: XCircle },
  completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600 border border-slate-200', icon: CheckCircle },
};

const paymentStatusConfig: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Payment Pending', cls: 'bg-amber-50 text-amber-700' },
  in_escrow: { label: 'In Escrow', cls: 'bg-blue-50 text-blue-700' },
  released: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700' },
};

export default function MyApplicationsContent() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = applications.filter(a => {
    const matchSearch = a.campaignTitle.toLowerCase().includes(search.toLowerCase()) || a.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const approved = applications.filter(a => a.status === 'approved').length;
  const pending = applications.filter(a => a.status === 'pending').length;
  const completed = applications.filter(a => a.status === 'completed').length;
  const totalEarned = applications.filter(a => a.paymentStatus === 'released').reduce((s, a) => s + (a.paymentAmount ?? 0), 0);

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Applications</h1>
          <p className="text-slate-500 text-sm mt-1">Track all your campaign applications and their current status</p>
        </div>
        <Link href="/campaign-discovery" className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all">
          <Search size={15} /> Discover Campaigns
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Campaigns', value: approved, color: 'text-emerald-700', icon: CheckCircle },
          { label: 'Pending Review', value: pending, color: 'text-amber-700', icon: Clock },
          { label: 'Completed', value: completed, color: 'text-violet-700', icon: Briefcase },
          { label: 'Total Earned', value: `₹${totalEarned.toLocaleString()}`, color: 'text-slate-800', icon: DollarSign },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={stat.color} />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
              </div>
              <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search campaigns or brands..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white w-full" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Not Selected</option>
            <option value="completed">Completed</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} applications</span>
      </div>

      {/* Applications list */}
      <div className="space-y-3">
        {filtered.map(app => {
          const sConfig = statusConfig[app.status];
          const StatusIcon = sConfig.icon;
          return (
            <div key={app.id} className={`bg-white rounded-xl border shadow-sm p-5 transition-all hover:shadow-md ${app.status === 'approved' ? 'border-emerald-200' : app.status === 'shortlisted' ? 'border-violet-200' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-violet-700 text-xs font-bold">{app.brandAvatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-slate-800">{app.campaignTitle}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sConfig.cls}`}>
                        <StatusIcon size={10} />{sConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{app.brand} · Applied {app.appliedAt}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <PlatformBadge platform={app.platform} />
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1"><DollarSign size={10} />${app.budget.toLocaleString()}</span>
                      <span className="text-xs text-slate-400">Deadline: {app.deadline}</span>
                      {app.paymentStatus && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${paymentStatusConfig[app.paymentStatus]?.cls}`}>
                          {paymentStatusConfig[app.paymentStatus]?.label}
                          {app.paymentAmount && ` · ₹${app.paymentAmount.toLocaleString()}`}
                        </span>
                      )}
                    </div>
                    {app.feedback && (
                      <div className="mt-2 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                        <p className="text-xs text-slate-500 italic">"{app.feedback}"</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {app.deliverables.map(d => (
                        <span key={d} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {app.status === 'approved' && (
                    <Link href="/messaging-inbox" className="flex items-center gap-1.5 text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors">
                      <MessageSquare size={12} /> Message Brand
                    </Link>
                  )}
                  <Link href="/campaign-discovery" className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors">
                    <Eye size={12} /> View
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
            <Briefcase size={36} className="text-slate-300 mb-3" />
            <h3 className="text-slate-700 font-semibold mb-1">No applications found</h3>
            <p className="text-slate-400 text-sm mb-4">Try adjusting your filters or discover new campaigns</p>
            <Link href="/campaign-discovery" className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">Discover Campaigns</Link>
          </div>
        )}
      </div>
    </div>
  );
}
